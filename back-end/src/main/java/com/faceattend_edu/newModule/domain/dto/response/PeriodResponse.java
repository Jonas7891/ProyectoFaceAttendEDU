package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.School;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PeriodResponse(
        Integer id,
        SchoolResponse school,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}