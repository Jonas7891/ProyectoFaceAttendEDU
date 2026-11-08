package com.faceattend_edu.authorization_service.domain.exception;

/** The caller is known but not allowed to do this. */
public class ForbiddenException extends DomainException {
    public ForbiddenException(String message) { super(message); }
}
