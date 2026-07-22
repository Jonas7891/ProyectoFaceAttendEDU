package com.faceattend_edu.newModule.domain.exception;

public class BusinessException extends com.faceattend_edu.newModule.domain.exception.BaseException {

    public BusinessException(String errorCode, String message) {
        super(errorCode, message, 422);
    }
}