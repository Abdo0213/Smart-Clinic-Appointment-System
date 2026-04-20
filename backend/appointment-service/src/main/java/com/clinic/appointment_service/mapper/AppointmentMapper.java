package com.clinic.appointment_service.mapper;

import com.clinic.appointment_service.dto.AppointmentRequestDTO;
import com.clinic.appointment_service.dto.AppointmentResponseDTO;
import com.clinic.appointment_service.dto.WaitlistRequestDTO;
import com.clinic.appointment_service.dto.WaitlistResponseDTO;
import com.clinic.appointment_service.entity.Appointment;
import com.clinic.appointment_service.entity.Waitlist;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "bookedBy", ignore = true)
    @Mapping(target = "cancellationReason", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Appointment toEntity(AppointmentRequestDTO dto);

    AppointmentResponseDTO toResponseDto(Appointment entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "addedAt", ignore = true)
    Waitlist toEntity(WaitlistRequestDTO dto);

    WaitlistResponseDTO toResponseDto(Waitlist entity);
}
