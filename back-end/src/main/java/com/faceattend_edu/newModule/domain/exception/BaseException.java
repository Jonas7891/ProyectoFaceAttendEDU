package com.faceattend_edu.newModule.domain.exception;

public abstract class BaseException extends RuntimeException {

    private final String errorCode;
    private final int httpStatus;

    public BaseException(String errorCode, String message, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}
