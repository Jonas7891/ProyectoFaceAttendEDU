package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.Enrollment;
import com.faceattend_edu.infrastructure.persistence.entity.EnrollmentEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EnrollmentRepositoryMapper {

    EnrollmentEntity toEntity(Enrollment enrollment);

    Enrollment toDomain(EnrollmentEntity entity);
}
