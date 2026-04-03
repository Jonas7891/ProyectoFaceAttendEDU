package com.faceattend_edu.domain.exception;

public class BusinessException extends BaseException {

    public BusinessException(String errorCode, String message) {
        super(errorCode, message, 422);
    }
}