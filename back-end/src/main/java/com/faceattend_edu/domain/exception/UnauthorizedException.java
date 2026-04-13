package com.faceattend_edu.domain.exception;

public class UnauthorizedException extends BaseException {

    public UnauthorizedException() {
        super("UNAUTHORIZED", "Debes iniciar sesión para continuar", 401);
    }

    public UnauthorizedException(String message) {
        super("UNAUTHORIZED", message, 401);
    }
}