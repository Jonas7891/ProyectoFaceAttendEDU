package com.faceattend_edu.newModule.domain.exception;

public class DuplicateResourceException extends BaseException {

    public DuplicateResourceException(String resourceName, String field, String value) {
        super(
                "DUPLICATE_RESOURCE",
                resourceName + " con " + field + " '" + value + "' ya existe",
                409
        );
    }
}