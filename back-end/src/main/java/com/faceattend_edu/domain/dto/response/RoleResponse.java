package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Module;
import java.util.List;

public record RoleResponse(
        Integer id,
        String name,
        String description,
        List<Module> modules
) {
}