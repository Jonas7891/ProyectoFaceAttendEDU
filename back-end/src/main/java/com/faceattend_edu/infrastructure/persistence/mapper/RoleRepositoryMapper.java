package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.Role;
import com.faceattend_edu.infrastructure.persistence.entity.RoleEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.qualifier.RoleEntityToRoleDomain;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleRepositoryMapper {

    RoleEntity toEntity(Role role);

    @RoleEntityToRoleDomain
    Role toDomain(RoleEntity entity);
}
