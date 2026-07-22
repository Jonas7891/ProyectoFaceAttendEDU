package com.faceattend_edu.newModule.domain.exception;

import java.util.Map;

public class ValidationException extends BaseException {

    private final Map<String, String> errors;

    // Un solo error
    public ValidationException(String field, String message) {
        super("VALIDATION_ERROR", "Error de validación en: " + field, 400);
        this.errors = Map.of(field, message);
    }

    // Múltiples errores
    public ValidationException(Map<String, String> errors) {
        super("VALIDATION_ERROR", "Errores de validación", 400);
        this.errors = errors;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}