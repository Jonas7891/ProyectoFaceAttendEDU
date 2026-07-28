package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.Justification;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.JustificationEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface JustificationRepositoryMapper extends AbstractRepositoryMapper<JustificationEntity, Justification> {
}
