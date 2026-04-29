package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.RoleRequest;
import com.faceattend_edu.domain.dto.response.RoleResponse;
import com.faceattend_edu.domain.model.Role;
import com.faceattend_edu.infrastructure.persistence.entity.RoleEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.qualifier.RoleEntityToRoleDomain;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleRepositoryMapper {

    RoleEntity toEntity(Role role);

    @RoleEntityToRoleDomain
    Role toDomain(RoleEntity entity);
}
