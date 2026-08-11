package com.faceattend_edu.academic.infrastructure.persistence.mapper;

import com.faceattend_edu.academic.domain.model.Enrollment;
import com.faceattend_edu.academic.infrastructure.persistence.entity.EnrollmentEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EnrollmentRepositoryMapper extends AbstractRepositoryMapper<EnrollmentEntity, Enrollment> {
}
