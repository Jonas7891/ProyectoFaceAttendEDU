package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.User;
import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.qualifier.UserEntityToUserDomain;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserRepositoryMapper {

    @UserEntityToUserDomain
    @Mapping(target = "roles", ignore = true)
    User toDomain(UserEntity entity);

    @Mapping(target = "roles", ignore = true)
    UserEntity toEntity(User user);
}
