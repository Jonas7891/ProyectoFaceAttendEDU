package com.faceattend_edu.attendance_service.domain.port.out;

import java.util.Optional;

/** The current status of a class session, as Scheduling (its owner) reports it. */
public interface ClassSessionStatusPort {

    /**
     * {@code Open}, {@code Closed} or {@code Cancelled}; empty when the session does not exist
     * for the caller.
     *
     * @throws com.faceattend_edu.attendance_service.domain.exception.DependencyUnavailableException
     *         when Scheduling cannot answer: the caller must not guess
     */
    Optional<String> statusOf(Long classSessionId);
}
