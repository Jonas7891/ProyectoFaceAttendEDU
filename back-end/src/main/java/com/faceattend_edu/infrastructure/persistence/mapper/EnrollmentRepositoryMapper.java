package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.EnrollmentRequest;
import com.faceattend_edu.domain.dto.response.EnrollmentResponse;
import com.faceattend_edu.domain.model.Enrollment;
import com.faceattend_edu.infrastructure.persistence.entity.CourseEntity;
import com.faceattend_edu.infrastructure.persistence.entity.EnrollmentEntity;
import com.faceattend_edu.infrastructure.persistence.entity.PeriodEntity;
import com.faceattend_edu.infrastructure.persistence.entity.PersonEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface EnrollmentRepositoryMapper {

    EnrollmentEntity toEntity(Enrollment enrollment);

    Enrollment toDomain(EnrollmentEntity entity);
}
