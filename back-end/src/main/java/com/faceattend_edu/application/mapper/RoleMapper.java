package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.RoleRequest;
import com.faceattend_edu.domain.dto.response.RoleResponse;
import com.faceattend_edu.domain.model.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {

    public Role toDomain(RoleRequest request) {
        return new Role(
                null,
                request.name(),
                request.description()
        );
    }

    public RoleResponse toResponse(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription()
        );
    }
}
