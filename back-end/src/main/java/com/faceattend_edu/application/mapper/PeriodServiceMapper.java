package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.PeriodRequest;
import com.faceattend_edu.domain.dto.response.PeriodResponse;
import com.faceattend_edu.domain.model.Period;
import org.springframework.stereotype.Component;

@Component
public class PeriodServiceMapper {

    public Period toDomain(PeriodRequest request) {
        return new Period(
                null,
                request.school(),
                request.name(),
                request.startDate(),
                request.endDate(),
                request.isActive()
        );
    }

    public PeriodResponse toResponse(Period period) {
        return new PeriodResponse(
                period.getId(),
                period.getSchool(),
                period.getName(),
                period.getStartDate(),
                period.getEndDate(),
                period.getIsActive()
        );
    }
}
