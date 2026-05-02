package com.clinic.appointment_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.clinic.appointment_service.entity.Appointment;
import com.clinic.appointment_service.entity.AppointmentStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    Page<Appointment> findAllByPatientId(UUID patientId, Pageable pageable);

    Page<Appointment> findAllByDoctorId(UUID doctorId, Pageable pageable);

    Page<Appointment> findAllBySlotDate(LocalDate slotDate, Pageable pageable);

    Page<Appointment> findAllByStatus(AppointmentStatus status, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE " +
            "(cast(:patientId as string) IS NULL OR a.patientId = :patientId) AND " +
            "(cast(:doctorId as string) IS NULL OR a.doctorId = :doctorId) AND " +
            "(cast(:slotDate as string) IS NULL OR a.slotDate = :slotDate) AND " +
            "(cast(:status as string) IS NULL OR a.status = :status)")
    Page<Appointment> findWithFilters(@Param("patientId") UUID patientId,
            @Param("doctorId") UUID doctorId,
            @Param("slotDate") LocalDate slotDate,
            @Param("status") AppointmentStatus status,
            Pageable pageable);

    boolean existsByDoctorIdAndSlotDateAndSlotStart(UUID doctorId, LocalDate slotDate, java.time.LocalTime slotStart);

    boolean existsByPatientIdAndDoctorIdAndSlotDateAndStatusNot(UUID patientId, UUID doctorId, LocalDate slotDate,
            AppointmentStatus status);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.patientId = :patientId " +
            "AND a.slotDate = :date AND a.status != 'CANCELLED' " +
            "AND a.slotStart < :end AND a.slotEnd > :start")
    boolean existsOverlappingAppointment(@Param("patientId") UUID patientId,
                                        @Param("date") LocalDate date,
                                        @Param("start") java.time.LocalTime start,
                                        @Param("end") java.time.LocalTime end);
}
