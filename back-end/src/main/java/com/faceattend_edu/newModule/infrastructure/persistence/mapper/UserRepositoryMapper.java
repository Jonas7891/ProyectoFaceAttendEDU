package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.User;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.UserEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserRepositoryMapper extends AbstractRepositoryMapper<UserEntity, User> {
}
