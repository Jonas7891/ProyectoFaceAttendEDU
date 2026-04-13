package com.faceattend_edu.domain.dto.request;

import com.faceattend_edu.domain.model.Action;
import com.faceattend_edu.domain.model.View;
import jakarta.validation.constraints.NotNull;

public record ViewActionRequest(
        @NotNull(message = "La vista es requerida")
        View idView,

        @NotNull(message = "La acción es requerida")
        Action idAction
) {
}