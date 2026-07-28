package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.Classroom;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.ClassroomEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClassroomRepositoryMapper extends AbstractRepositoryMapper<ClassroomEntity, Classroom> {
}
