package com.faceattend_edu.domain.dto.response;

public record ViewResponse(
        Integer id,
        String name,
        String route,
        String title,
        Boolean isPublic
) {
}