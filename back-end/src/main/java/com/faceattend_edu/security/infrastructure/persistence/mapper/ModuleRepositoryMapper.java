package com.faceattend_edu.security.infrastructure.persistence.mapper;

import com.faceattend_edu.security.domain.model.Module;
import com.faceattend_edu.security.infrastructure.persistence.entity.ModuleEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ModuleRepositoryMapper extends AbstractRepositoryMapper<ModuleEntity, Module> {
}
