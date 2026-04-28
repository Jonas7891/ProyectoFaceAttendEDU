package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.UserRoleRequest;
import com.faceattend_edu.domain.dto.response.UserRoleResponse;
import com.faceattend_edu.domain.model.UserRole;
import org.springframework.stereotype.Component;

@Component
public class UserRoleServiceMapper {

    public UserRole toDomain(UserRoleRequest request) {
        return new UserRole(
                request.user(),
                request.role(),
                request.assignedDate(),
                request.expiryDate()
        );
    }

    public UserRoleResponse toResponse(UserRole userRole) {
        return new UserRoleResponse(
                null,
                userRole.getUser(),
                userRole.getRole(),
                userRole.getAssignedDate(),
                userRole.getExpiryDate()
        );
    }
}
