package com.faceattend_edu.newModule.domain.dto.response;

public record ActionResponse(
        Integer id,
        String name,
        String description,
        String httpMethod,
        Boolean enabled
) {
}