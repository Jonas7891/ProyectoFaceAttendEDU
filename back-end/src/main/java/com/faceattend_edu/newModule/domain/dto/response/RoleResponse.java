package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Module;

import java.time.LocalDateTime;
import java.util.List;

public record RoleResponse(
        Integer id,
        List<ModuleResponse> modules,
        String name,
        String description,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}