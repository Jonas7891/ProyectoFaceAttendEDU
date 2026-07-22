package com.faceattend_edu.newModule.domain.exception;

public class ForbiddenException extends BaseException {

    public ForbiddenException() {
        super("FORBIDDEN", "No tienes permisos para realizar esta acción", 403);
    }

    public ForbiddenException(String action) {
        super("FORBIDDEN", "No tienes permisos para: " + action, 403);
    }
}