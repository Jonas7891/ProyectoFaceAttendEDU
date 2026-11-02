package com.faceattend_edu.identity_service.application.port.out;

import java.time.LocalDateTime;
import java.util.UUID;

public interface CloseUserSessionsPort {

    /** Closes every Active session of the user in one statement; returns how many were closed. */
    int closeActiveSessionsOfUser(UUID userId, LocalDateTime closedAt);
}
