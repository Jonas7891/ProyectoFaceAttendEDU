package com.faceattend_edu.newModule.domain.exception;

import java.util.UUID;

public class NotFoundException extends com.faceattend_edu.newModule.domain.exception.BaseException {

    public NotFoundException(String resourceName, Integer id) {
        super(
                "NOT_FOUND",
                resourceName + " con id " + id + " no fue encontrado",
                404
        );
    }

    public NotFoundException(String resourceName, Long id) {
        super(
                "NOT_FOUND",
                resourceName + " con id " + id + " no fue encontrado",
                404
        );
    }

    public NotFoundException(String resourceName, UUID id) {
        super(
                "NOT_FOUND",
                resourceName + " con id " + id + " no fue encontrado",
                404
        );
    }

    public NotFoundException(String resourceName, String id) {
        super(
                "NOT_FOUND",
                resourceName + " con id " + id + " no fue encontrado",
                404
        );
    }

    public NotFoundException(String resourceName, Object id) {
        super(
                "NOT_FOUND",
                resourceName + " con id " + id + " no fue encontrado",
                404
        );
    }

    // Sobrecarga: buscar por campo distinto al id
    public NotFoundException(String resourceName, String field, String value) {
        super(
                "NOT_FOUND",
                resourceName + " con " + field + " '" + value + "' no fue encontrado",
                404
        );
    }
}