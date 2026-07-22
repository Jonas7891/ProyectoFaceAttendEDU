package com.faceattend_edu.newModule.domain.dto.response;

import java.util.List;

public record RoleResponse(
        Integer id,
        String name,
        String description,
        List<ModuleResponse> modules
) {
}