package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.Action;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.ActionEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ActionRepositoryMapper extends AbstractRepositoryMapper<ActionEntity, Action> {
}
