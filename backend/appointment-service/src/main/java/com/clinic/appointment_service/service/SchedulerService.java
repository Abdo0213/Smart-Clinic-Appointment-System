package com.clinic.appointment_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.scheduler.SchedulerClient;
import software.amazon.awssdk.services.scheduler.model.CreateScheduleRequest;
import software.amazon.awssdk.services.scheduler.model.DeleteScheduleRequest;
import software.amazon.awssdk.services.scheduler.model.FlexibleTimeWindow;
import software.amazon.awssdk.services.scheduler.model.FlexibleTimeWindowMode;
import software.amazon.awssdk.services.scheduler.model.ResourceNotFoundException;
import software.amazon.awssdk.services.scheduler.model.Target;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final SchedulerClient schedulerClient;
    private final ObjectMapper objectMapper;

    @Value("${aws.eventbridge.role-arn}")
    private String schedulerRoleArn;

    @Value("${aws.sqs.queue-arn}")
    private String sqsQueueArn;

    private static final String TIMEZONE = "Africa/Cairo";

    /**
     * Create:
     * - 24h reminder
     * - 2h reminder
     */
    public void createReminderSchedules(
            UUID appointmentId,
            UUID userId,
            String email,
            LocalDateTime appointmentTime) {

        log.info("Creating reminder schedules for appointment: {}", appointmentId);
        log.info("Appointment time: {}", appointmentTime);

        createSingleSchedule(
                appointmentId,
                userId,
                email,
                appointmentTime.minusHours(24),
                "24h");

        createSingleSchedule(
                appointmentId,
                userId,
                email,
                appointmentTime.minusHours(2),
                "2h");
    }

    /**
     * Creates one EventBridge Scheduler one-time schedule.
     */
    public void createSingleSchedule(
            UUID appointmentId,
            UUID userId,
            String email,
            LocalDateTime triggerTime,
            String reminderType) {

        try {

            // Prevent creating past schedules
            if (triggerTime.isBefore(LocalDateTime.now())) {

                log.warn(
                        "Skipping past schedule for appointment {} - triggerTime={}",
                        appointmentId,
                        triggerTime);

                return;
            }

            String scheduleName = String.format("appointment-%s-%s", appointmentId, reminderType);

            // IMPORTANT:
            // DO NOT convert timezone manually.
            // EventBridge handles timezone itself using:
            // .scheduleExpressionTimezone(TIMEZONE)

            String formattedTime = triggerTime.format(
                    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));

            String scheduleExpression = "at(" + formattedTime + ")";

            log.info("=================================================");
            log.info("Creating EventBridge Schedule");
            log.info("Schedule Name: {}", scheduleName);
            log.info("Trigger Time: {}", triggerTime);
            log.info("Schedule Expression: {}", scheduleExpression);
            log.info("Timezone: {}", TIMEZONE);
            log.info("SQS ARN: {}", sqsQueueArn);
            log.info("Role ARN: {}", schedulerRoleArn);
            log.info("=================================================");

            if (userId == null || email == null) {

                log.warn(
                        "Skipping schedule due to null values. userId={}, email={}",
                        userId,
                        email);

                return;
            }

            Map<String, Object> payload = new HashMap<>();

            payload.put("appointmentId", appointmentId);
            payload.put("userId", userId);
            payload.put("email", email);
            payload.put("reminderType", reminderType);

            String input = objectMapper.writeValueAsString(payload);

            CreateScheduleRequest request = CreateScheduleRequest.builder()
                    .name(scheduleName)
                    .scheduleExpression(scheduleExpression)

                    // IMPORTANT
                    // AWS handles timezone here
                    .scheduleExpressionTimezone(TIMEZONE)

                    .flexibleTimeWindow(
                            FlexibleTimeWindow.builder()
                                    .mode(FlexibleTimeWindowMode.OFF)
                                    .build())

                    .target(
                            Target.builder()
                                    .arn(sqsQueueArn)
                                    .roleArn(schedulerRoleArn)
                                    .input(input)
                                    .build())
                    .build();

            schedulerClient.createSchedule(request);

            log.info(
                    "SUCCESSFULLY created schedule {} for appointment {}",
                    scheduleName,
                    appointmentId);

        } catch (JsonProcessingException e) {

            log.error(
                    "JSON serialization error for appointment {}",
                    appointmentId,
                    e);

        } catch (Exception e) {

            log.error(
                    "ERROR creating schedule for appointment {}",
                    appointmentId,
                    e);
        }
    }

    /**
     * Delete schedules when:
     * - appointment cancelled
     * - appointment updated
     */
    public void deleteReminderSchedules(UUID appointmentId) {

        deleteSchedule(
                String.format("appointment-%s-24h", appointmentId));

        deleteSchedule(
                String.format("appointment-%s-2h", appointmentId));
    }

    private void deleteSchedule(String scheduleName) {

        try {

            schedulerClient.deleteSchedule(
                    DeleteScheduleRequest.builder()
                            .name(scheduleName)
                            .build());

            log.info("Deleted schedule: {}", scheduleName);

        } catch (ResourceNotFoundException e) {

            log.warn("Schedule not found: {}", scheduleName);

        } catch (Exception e) {

            log.error("Error deleting schedule: {}", scheduleName, e);
        }
    }
}