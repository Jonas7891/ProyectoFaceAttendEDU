package com.faceattend_edu.domain.dto.request;

import com.faceattend_edu.domain.model.Module;
import com.faceattend_edu.domain.model.Role;
import jakarta.validation.constraints.NotNull;

public record RoleModuleRequest(
        @NotNull(message = "El rol es requerido")
        Role idRole,

        @NotNull(message = "El módulo es requerido")
        Module idModule
) {
}