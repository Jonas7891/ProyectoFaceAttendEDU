package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.School;

import java.time.LocalDateTime;

public record CourseResponse(
        Integer id,
        SchoolResponse school,
        String name,
        String code,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}