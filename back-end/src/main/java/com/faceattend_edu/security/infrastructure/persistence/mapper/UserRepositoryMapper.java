package com.faceattend_edu.security.infrastructure.persistence.mapper;

import com.faceattend_edu.security.domain.model.User;
import com.faceattend_edu.security.infrastructure.persistence.entity.UserEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserRepositoryMapper extends AbstractRepositoryMapper<UserEntity, User> {
}
