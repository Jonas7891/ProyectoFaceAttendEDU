package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.RoleRequest;
import com.faceattend_edu.domain.dto.response.RoleResponse;
import com.faceattend_edu.domain.model.Role;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RoleServiceMapper {

    public Role toDomain(RoleRequest request) {
        return new Role(
                null,
                request.name(),
                request.description(),
                List.of(),
                List.of()
        );
    }

    public RoleResponse toResponse(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.getModules()
        );
    }
}
