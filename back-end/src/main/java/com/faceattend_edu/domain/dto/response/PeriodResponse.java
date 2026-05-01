package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.School;

import java.time.LocalDate;

public record PeriodResponse(
        Integer id,
        SchoolResponse school,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        Boolean isActive
) {
}