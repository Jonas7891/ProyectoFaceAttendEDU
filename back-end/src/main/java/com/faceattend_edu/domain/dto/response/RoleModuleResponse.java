package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Module;
import com.faceattend_edu.domain.model.Role;

public record RoleModuleResponse(
        Integer id,
        Role idRole,
        Module idModule
) {
}