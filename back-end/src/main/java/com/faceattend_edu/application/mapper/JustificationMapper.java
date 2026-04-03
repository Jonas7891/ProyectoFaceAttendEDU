package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.JustificationRequest;
import com.faceattend_edu.domain.dto.response.JustificationResponse;
import com.faceattend_edu.domain.model.Justification;
import org.springframework.stereotype.Component;

@Component
public class JustificationMapper {

    public Justification toDomain(JustificationRequest request) {
        return new Justification(
                null,
                request.idAttendance(),
                request.justification(),
                request.approval(),
                request.createdAt(),
                request.reviewedBy(),
                request.reviewedAt()
        );
    }

    public JustificationResponse toResponse(Justification justification) {
        return new JustificationResponse(
                justification.getId(),
                justification.getIdAttendance(),
                justification.getJustification(),
                justification.getApproval(),
                justification.getCreatedAt(),
                justification.getReviewedBy(),
                justification.getReviewedAt()
        );
    }
}
