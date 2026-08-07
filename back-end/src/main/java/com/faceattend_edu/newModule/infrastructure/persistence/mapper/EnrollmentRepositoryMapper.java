package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.Enrollment;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.EnrollmentEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EnrollmentRepositoryMapper extends AbstractRepositoryMapper<EnrollmentEntity, Enrollment> {
}
