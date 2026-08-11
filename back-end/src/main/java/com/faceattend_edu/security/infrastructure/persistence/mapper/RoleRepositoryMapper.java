package com.faceattend_edu.security.infrastructure.persistence.mapper;

import com.faceattend_edu.security.domain.model.Role;
import com.faceattend_edu.security.infrastructure.persistence.entity.RoleEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleRepositoryMapper extends AbstractRepositoryMapper<RoleEntity, Role> {
}
