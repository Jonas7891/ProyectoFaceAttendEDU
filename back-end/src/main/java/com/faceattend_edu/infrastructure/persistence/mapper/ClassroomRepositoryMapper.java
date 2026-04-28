package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.ClassroomRequest;
import com.faceattend_edu.domain.dto.response.ClassroomResponse;
import com.faceattend_edu.domain.model.Classroom;
import com.faceattend_edu.infrastructure.persistence.entity.ClassroomEntity;
import com.faceattend_edu.infrastructure.persistence.entity.SchoolEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface ClassroomRepositoryMapper {

    ClassroomEntity toEntity(Classroom classroom);

    Classroom toDomain(ClassroomEntity entity);
}
