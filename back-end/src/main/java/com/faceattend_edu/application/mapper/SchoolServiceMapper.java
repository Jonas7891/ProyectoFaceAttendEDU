package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.SchoolRequest;
import com.faceattend_edu.domain.dto.response.SchoolResponse;
import com.faceattend_edu.domain.model.School;
import org.springframework.stereotype.Component;

@Component
public class SchoolServiceMapper {

    public School toDomain(SchoolRequest request) {
        return new School(
                null,
                request.name(),
                request.nit(),
                request.address(),
                request.phone(),
                request.email(),
                request.status(),
                request.createdAt(),
                request.updatedAt()
        );
    }

    public SchoolResponse toResponse(School school) {
        return new SchoolResponse(
                school.getId(),
                school.getName(),
                school.getNit(),
                school.getAddress(),
                school.getPhone(),
                school.getEmail(),
                school.getStatus(),
                school.getCreatedAt(),
                school.getUpdatedAt()
        );
    }
}
