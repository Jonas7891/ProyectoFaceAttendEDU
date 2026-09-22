package com.faceattend_edu.identity_service.adapter.in.web.mapper;

import com.faceattend_edu.identity_service.adapter.in.web.dto.SchoolDto;
import com.faceattend_edu.identity_service.domain.model.School;
import org.springframework.stereotype.Component;

@Component
public class SchoolWebMapper {

    public SchoolDto toDto(School domain) {
        if (domain == null) return null;
        SchoolDto dto = new SchoolDto();
        dto.setSchoolId(domain.getSchoolId());
        dto.setName(domain.getName());
        dto.setNit(domain.getNit());
        dto.setAddress(domain.getAddress());
        dto.setStatus(domain.getStatus());
        return dto;
    }

    public School toDomain(SchoolDto dto) {
        if (dto == null) return null;
        School school = new School();
        school.setSchoolId(dto.getSchoolId());
        school.setName(dto.getName());
        school.setNit(dto.getNit());
        school.setAddress(dto.getAddress());
        school.setStatus(dto.getStatus());
        return school;
    }
}
