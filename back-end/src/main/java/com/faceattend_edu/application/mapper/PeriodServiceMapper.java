package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.PeriodRequest;
import com.faceattend_edu.domain.dto.response.PeriodResponse;
import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.domain.model.School;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class PeriodServiceMapper {

    private final SchoolServiceMapper schoolServiceMapper;

    public Period toDomain(PeriodRequest request,
                           School school) {
        return new Period(
                null,
                school,
                request.name(),
                request.startDate(),
                request.endDate(),
                request.isActive()
        );
    }

    public PeriodResponse toResponse(Period period) {
        return new PeriodResponse(
                period.getId(),
                schoolServiceMapper.toResponse(period.getSchool()),
                period.getName(),
                period.getStartDate(),
                period.getEndDate(),
                period.getIsActive()
        );
    }
}
