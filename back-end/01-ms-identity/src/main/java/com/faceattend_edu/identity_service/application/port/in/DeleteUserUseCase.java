package com.faceattend_edu.identity_service.application.port.in;

import java.util.UUID;

/** Soft delete of an account (AGENTS.md 2.2): deleted_at/deleted_by filled, status off, sessions closed, roles withdrawn. */
public interface DeleteUserUseCase {

    /**
     * @param callerUserId the session user, recorded as deleted_by; never equal to {@code userId}
     * @param token        the caller's own session token, used to withdraw the roles in authorization
     */
    void deleteUser(UUID userId, UUID callerUserId, String token);
}
