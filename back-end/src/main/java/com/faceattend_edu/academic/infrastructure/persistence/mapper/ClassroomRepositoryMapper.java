package com.faceattend_edu.academic.infrastructure.persistence.mapper;

import com.faceattend_edu.academic.domain.model.Classroom;
import com.faceattend_edu.academic.infrastructure.persistence.entity.ClassroomEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClassroomRepositoryMapper extends AbstractRepositoryMapper<ClassroomEntity, Classroom> {
}
