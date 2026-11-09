package com.faceattend_edu.authorization_service.domain.port.in;

import com.faceattend_edu.authorization_service.domain.model.Caller;

import java.util.UUID;

/** Grants and takes roles; both throw ForbiddenException when the caller may not change that role for that user. */
public interface AssignRoleToUserUseCase {
    void assignRoleToUser(Caller caller, UUID userId, Integer roleId);

    void removeRoleFromUser(Caller caller, UUID userId, Integer roleId);
}
