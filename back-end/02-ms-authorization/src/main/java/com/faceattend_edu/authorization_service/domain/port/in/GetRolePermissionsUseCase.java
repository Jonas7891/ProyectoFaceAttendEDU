package com.faceattend_edu.authorization_service.domain.port.in;

import com.faceattend_edu.authorization_service.domain.model.Permission;

import java.util.List;

public interface GetRolePermissionsUseCase {
    /** Permissions of a role; EntityNotFoundException when the role does not exist. */
    List<Permission> permissionsOf(Integer roleId);
}
