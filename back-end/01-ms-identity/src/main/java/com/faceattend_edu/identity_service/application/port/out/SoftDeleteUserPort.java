package com.faceattend_edu.identity_service.application.port.out;

import java.time.LocalDateTime;
import java.util.UUID;

public interface SoftDeleteUserPort {

    /**
     * Marks a user row deleted (deleted_at, deleted_by, status=false) only if it is not deleted yet.
     *
     * @return rows changed: 1, or 0 when the user does not exist or was already deleted
     */
    int softDeleteUser(UUID userId, UUID deletedBy, LocalDateTime deletedAt);
}
