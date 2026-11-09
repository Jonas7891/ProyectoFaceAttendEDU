package com.faceattend_edu.attendance_service.domain.exception;

/** A service this one needs to decide could not answer; the request fails instead of guessing (503). */
public class DependencyUnavailableException extends DomainException {
    public DependencyUnavailableException(String message) { super(message); }
    public DependencyUnavailableException(String message, Throwable cause) { super(message, cause); }
}
