package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.Log;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.LogEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LogRepositoryMapper extends AbstractRepositoryMapper<LogEntity, Log> {
}
