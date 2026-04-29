package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.LogRequest;
import com.faceattend_edu.domain.dto.response.LogResponse;
import com.faceattend_edu.domain.model.Log;
import com.faceattend_edu.infrastructure.persistence.entity.LogEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface LogRepositoryMapper {

    LogEntity toEntity(Log log);

    Log toDomain(LogEntity entity);
}
