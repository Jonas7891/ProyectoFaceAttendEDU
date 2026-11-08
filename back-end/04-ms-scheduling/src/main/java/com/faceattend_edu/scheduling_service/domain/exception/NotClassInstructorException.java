package com.faceattend_edu.scheduling_service.domain.exception;

/**
 * 403, not 404: the session is in the caller's own school (its existence is no secret) but its
 * class belongs to another instructor.
 */
public class NotClassInstructorException extends DomainException {
    public NotClassInstructorException() {
        super("Only the instructor of this class or a school administrator can modify its session");
    }
}
