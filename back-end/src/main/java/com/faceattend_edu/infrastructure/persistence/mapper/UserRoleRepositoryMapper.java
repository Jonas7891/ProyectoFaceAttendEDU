package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.UserRoleRequest;
import com.faceattend_edu.domain.dto.response.UserRoleResponse;
import com.faceattend_edu.domain.model.UserRole;
import com.faceattend_edu.infrastructure.persistence.entity.RoleEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserRoleEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface UserRoleRepositoryMapper {

    @Mapping(source = "user.id", target = "user.id")
    @Mapping(source = "role.id", target = "role.id")
    UserRoleEntity toEntity(UserRole userRole);

    @Mapping(source = "user.id", target = "user.id")
    @Mapping(source = "role.id", target = "role.id")
    UserRole toDomain(UserRoleEntity entity);
}
