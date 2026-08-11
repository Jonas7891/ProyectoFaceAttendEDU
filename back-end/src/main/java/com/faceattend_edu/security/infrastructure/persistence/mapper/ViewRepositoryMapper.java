package com.faceattend_edu.security.infrastructure.persistence.mapper;

import com.faceattend_edu.security.domain.model.View;
import com.faceattend_edu.security.infrastructure.persistence.entity.ViewEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ViewRepositoryMapper extends AbstractRepositoryMapper<ViewEntity, View> {
}
