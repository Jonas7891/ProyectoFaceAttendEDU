package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.UserRoleRequest;
import com.faceattend_edu.domain.dto.response.UserRoleResponse;
import com.faceattend_edu.domain.model.UserRole;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class UserRoleServiceMapper {

    public UserRole toDomain(UserRoleRequest request) {
        return new UserRole(
                request.userId(),
                request.roleId(),
                null,  // Se cargarán desde la BD
                null,  // Se cargarán desde la BD
                Instant.now(),
                request.expiryDate()
        );
    }

    public UserRoleResponse toResponse(UserRole domain) {
        boolean isActive = domain.getExpiryDate() == null ||
                domain.getExpiryDate().isAfter(Instant.now());

        return new UserRoleResponse(
                domain.getUserId(),
                domain.getRoleId(),
                //domain.getRole() != null ? domain.getRole().getName() : "UNKNOWN",
                domain.getAssignedDate(),
                domain.getExpiryDate()
        );
    }
}
