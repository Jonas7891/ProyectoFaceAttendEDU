package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.View;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.ViewEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ViewRepositoryMapper extends AbstractRepositoryMapper<ViewEntity, View> {
}
