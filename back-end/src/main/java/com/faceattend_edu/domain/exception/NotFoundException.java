package com.faceattend_edu.domain.exception;

public class NotFoundException extends BaseException {

    public NotFoundException(String resourceName, Integer id) {
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