package com.clinic.visit_service.mapper;

import com.clinic.visit_service.dto.VisitResponse;
import com.clinic.visit_service.entity.Visit;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VisitMapper {
    VisitResponse toResponse(Visit visit);
    void updateEntity(com.clinic.visit_service.dto.VisitRequest request, @MappingTarget Visit visit);
}
