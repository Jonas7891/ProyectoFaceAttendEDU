package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.UserPatch;
import com.faceattend_edu.newModule.domain.dto.request.UserRequest;
import com.faceattend_edu.newModule.domain.dto.response.UserResponse;
import com.faceattend_edu.newModule.domain.model.User;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserServiceMapper
        extends AbstractServiceMapper<User, UserRequest, UserResponse, UserPatch> {

    @Override
    @Mapping(source = "personId", target = "person.id")
    @Mapping(source = "roleId", target = "role.id")
    User toDomain(UserRequest userRequest);
}
