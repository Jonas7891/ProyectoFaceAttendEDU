package com.faceattend_edu.domain.dto.request;

import com.faceattend_edu.domain.model.Module;
import com.faceattend_edu.domain.model.View;
import jakarta.validation.constraints.NotNull;

public record ViewModuleRequest(
        @NotNull(message = "La vista es requerida")
        View idView,

        @NotNull(message = "El módulo es requerido")
        Module idModule
) {
}