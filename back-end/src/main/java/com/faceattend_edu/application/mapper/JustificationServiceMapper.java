package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.JustificationRequest;
import com.faceattend_edu.domain.dto.response.JustificationResponse;
import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.domain.model.Justification;
import com.faceattend_edu.domain.model.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class JustificationServiceMapper {

    private final AttendanceServiceMapper attendanceServiceMapper;
    private final UserServiceMapper userServiceMapper;

    public Justification toDomain(JustificationRequest request,
                                  Attendance attendance,
                                  User reviewedBy) {
        return new Justification(
                null,
                attendance,
                request.justification(),
                request.approval(),
                request.createdAt(),
                reviewedBy,
                request.reviewedAt()
        );
    }

    public JustificationResponse toResponse(Justification justification) {
        return new JustificationResponse(
                justification.getId(),
                attendanceServiceMapper.toResponse(justification.getAttendance()),
                justification.getJustification(),
                justification.getApproval(),
                justification.getCreatedAt(),
                userServiceMapper.toResponse(justification.getReviewedBy()),
                justification.getReviewedAt()
        );
    }
}
