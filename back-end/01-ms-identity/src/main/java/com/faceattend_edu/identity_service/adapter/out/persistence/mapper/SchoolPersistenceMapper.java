package com.faceattend_edu.identity_service.adapter.out.persistence.mapper;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.SchoolJpaEntity;
import com.faceattend_edu.identity_service.domain.model.School;
import org.springframework.stereotype.Component;

@Component
public class SchoolPersistenceMapper {

    public School toDomain(SchoolJpaEntity entity) {
        if (entity == null) return null;
        return new School(
            entity.getSchoolId(),
            entity.getName(),
            entity.getNit(),
            entity.getAddress(),
            entity.getDistrict(),
            entity.getPhone(),
            entity.getEmail(),
            entity.getStatus(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    public SchoolJpaEntity toEntity(School domain) {
        if (domain == null) return null;
        return new SchoolJpaEntity(
            domain.getSchoolId(),
            domain.getName(),
            domain.getNit(),
            domain.getAddress(),
            domain.getDistrict(),
            domain.getPhone(),
            domain.getEmail(),
            domain.getStatus(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
}
