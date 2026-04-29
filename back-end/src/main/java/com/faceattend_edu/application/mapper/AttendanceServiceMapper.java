package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.domain.dto.response.AttendanceResponse;
import com.faceattend_edu.domain.model.Attendance;
import org.springframework.stereotype.Component;

@Component
public class AttendanceServiceMapper {

    public Attendance toDomain(AttendanceRequest request) {
        return new Attendance(
                null,
                request.student(),
                request.schedule(),
                request.iotDevice(),
                request.date(),
                request.time(),
                request.status()
        );
    }

    public AttendanceResponse toResponse(Attendance attendance) {
        return new AttendanceResponse(
                attendance.getId(),
                attendance.getStudent(),
                attendance.getSchedule(),
                attendance.getIotDevice(),
                attendance.getDate(),
                attendance.getTime(),
                attendance.getStatus()
        );
    }
}
