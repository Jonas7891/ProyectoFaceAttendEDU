package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.School;

import java.time.LocalDate;

public record PeriodResponse(
        Integer id,
        School school,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        Boolean isActive
) {
}