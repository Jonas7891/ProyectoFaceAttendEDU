package com.faceattend_edu.domain.dto.response;

public record ActionResponse(
        Integer id,
        String name,
        String description,
        String httpMethod,
        Boolean enabled
) {
}