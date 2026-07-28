package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.RolePatch;
import com.faceattend_edu.newModule.domain.dto.request.RoleRequest;
import com.faceattend_edu.newModule.domain.dto.response.RoleResponse;
import com.faceattend_edu.newModule.domain.model.Role;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleServiceMapper
        extends AbstractServiceMapper<Role, RoleRequest, RoleResponse, RolePatch> {
}
