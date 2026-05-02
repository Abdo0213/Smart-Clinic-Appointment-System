package com.clinic.doctor_service.mapper;

import com.clinic.doctor_service.dto.*;
import com.clinic.doctor_service.entity.*;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DoctorMapper {

    Doctor toEntity(DoctorRequestDTO dto);

    DoctorResponseDTO toResponseDto(Doctor doc);

    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "price", source = "price")
    Schedule toEntity(ScheduleRequestDTO dto);

    @Mapping(target = "doctorId", source = "doctor.id")
    @Mapping(target = "price", source = "price")
    ScheduleResponseDTO toResponseDto(Schedule schedule);

    ScheduleBreak toEntity(BreakDTO dto);

    BreakDTO toDto(ScheduleBreak scheduleBreak);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateDoctorFromDto(DoctorRequestDTO dto, @MappingTarget Doctor entity);
}
