package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.UserRoleRequest;
import com.faceattend_edu.domain.dto.response.UserRoleResponse;
import com.faceattend_edu.domain.model.UserRole;
import org.springframework.stereotype.Component;

@Component
public class UserRoleMapper {

    public UserRole toDomain(UserRoleRequest request) {
        return new UserRole(
                null,
                request.idUser(),
                request.idRole(),
                request.assignedDate(),
                request.expiryDate()
        );
    }

    public UserRoleResponse toResponse(UserRole userRole) {
        return new UserRoleResponse(
                userRole.getId(),
                userRole.getIdUser(),
                userRole.getIdRole(),
                userRole.getAssignedDate(),
                userRole.getExpiryDate()
        );
    }
}
