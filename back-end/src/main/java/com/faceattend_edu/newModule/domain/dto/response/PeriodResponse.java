package com.faceattend_edu.newModule.domain.dto.response;

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