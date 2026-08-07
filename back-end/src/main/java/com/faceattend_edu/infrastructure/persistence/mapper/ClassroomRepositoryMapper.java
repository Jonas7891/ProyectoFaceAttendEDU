package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.Classroom;
import com.faceattend_edu.infrastructure.persistence.entity.ClassroomEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClassroomRepositoryMapper {

    ClassroomEntity toEntity(Classroom classroom);

    Classroom toDomain(ClassroomEntity entity);
}
