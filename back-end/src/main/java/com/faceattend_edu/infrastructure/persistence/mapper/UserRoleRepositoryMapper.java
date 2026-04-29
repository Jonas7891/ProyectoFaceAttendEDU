package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.UserRole;
import com.faceattend_edu.infrastructure.persistence.entity.UserRoleEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.qualifier.RoleEntityToRoleDomain;
import com.faceattend_edu.infrastructure.persistence.mapper.qualifier.UserEntityToUserDomain;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserRepositoryMapper.class, RoleRepositoryMapper.class})
public interface UserRoleRepositoryMapper {

    @Mapping(source = "id.user", target = "userId")  // ✓ nombre real del campo
    @Mapping(source = "id.role", target = "roleId")  // ✓ nombre real del campo
    @Mapping(source = "user", target = "user", qualifiedBy = UserEntityToUserDomain.class)
    @Mapping(source = "role", target = "role", qualifiedBy = RoleEntityToRoleDomain.class)
    UserRole toDomain(UserRoleEntity entity);

    @Mapping(
            target = "id",
            expression = "java(new com.faceattend_edu.infrastructure.persistence.entity.UserRoleEntityId(domain.getUserId(), domain.getRoleId()))"
    )
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "role", ignore = true)
    UserRoleEntity toEntity(UserRole domain);
}