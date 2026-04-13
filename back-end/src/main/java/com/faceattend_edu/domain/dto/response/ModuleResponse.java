package com.faceattend_edu.domain.dto.response;

public record ModuleResponse(
        Integer id,
        String name,
        String description,
        String icon,
        Integer order
) {
}