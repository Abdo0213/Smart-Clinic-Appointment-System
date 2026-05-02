package com.clinic.visit_service.mapper;

import com.clinic.visit_service.dto.PrescriptionResponse;
import com.clinic.visit_service.entity.Prescription;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PrescriptionMapper {
    @Mapping(source = "visit.id", target = "visitId")
    PrescriptionResponse toResponse(Prescription prescription);
}
