package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.School;

import java.time.LocalDateTime;

public record ClassroomResponse(
        Integer id,
        SchoolResponse school,
        String name,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}