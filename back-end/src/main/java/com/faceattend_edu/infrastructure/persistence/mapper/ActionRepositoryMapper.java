package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.Action;
import com.faceattend_edu.infrastructure.persistence.entity.ActionEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ActionRepositoryMapper {

    ActionEntity toEntity(Action action);

    Action toDomain(ActionEntity entity);
}
