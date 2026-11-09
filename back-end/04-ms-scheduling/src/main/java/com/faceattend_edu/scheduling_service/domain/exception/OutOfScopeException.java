package com.faceattend_edu.scheduling_service.domain.exception;

/**
 * A record outside the caller's school. It answers 404, not 403: it must look exactly like a
 * missing record and never confirm that it exists in another school.
 */
public class OutOfScopeException extends EntityNotFoundException {
    public OutOfScopeException() {
        super("Entity", "outside caller's school");
    }
}
