package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.domain.dto.response.AttendanceResponse;
import com.faceattend_edu.domain.model.Attendance;
import org.springframework.stereotype.Component;

@Component
public class AttendanceMapper {

    public Attendance toDomain(AttendanceRequest request) {
        return new Attendance(
                null,
                request.idStudent(),
                request.idSchedule(),
                request.idDevice(),
                request.date(),
                request.time(),
                request.status()
        );
    }

    public AttendanceResponse toResponse(Attendance attendance) {
        return new AttendanceResponse(
                attendance.getId(),
                attendance.getIdStudent(),
                attendance.getIdSchedule(),
                attendance.getIdDevice(),
                attendance.getDate(),
                attendance.getTime(),
                attendance.getStatus()
        );
    }
}
