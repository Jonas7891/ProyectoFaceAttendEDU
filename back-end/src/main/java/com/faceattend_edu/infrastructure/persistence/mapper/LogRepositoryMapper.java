package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.Log;
import com.faceattend_edu.infrastructure.persistence.entity.LogEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LogRepositoryMapper {

    LogEntity toEntity(Log log);

    Log toDomain(LogEntity entity);
}
