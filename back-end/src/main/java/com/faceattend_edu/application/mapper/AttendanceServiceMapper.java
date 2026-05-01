package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.domain.dto.response.AttendanceResponse;
import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.domain.model.IotDevice;
import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.model.Schedule;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class AttendanceServiceMapper {

    private final PersonServiceMapper studentServiceMapper;
    private final ScheduleServiceMapper scheduleServiceMapper;
    private final IotDeviceServiceMapper iotDeviceServiceMapper;

    public Attendance toDomain(AttendanceRequest request,
                               Person student,
                               Schedule schedule,
                               IotDevice iotDevice) {
        return new Attendance(
                null,
                student,
                schedule,
                iotDevice,
                request.date(),
                request.time(),
                request.status()
        );
    }

    public AttendanceResponse toResponse(Attendance attendance) {
        return new AttendanceResponse(
                attendance.getId(),
                studentServiceMapper.toResponse(attendance.getStudent()),
                scheduleServiceMapper.toResponse(attendance.getSchedule()),
                iotDeviceServiceMapper.toResponse(attendance.getIotDevice()),
                attendance.getDate(),
                attendance.getTime(),
                attendance.getStatus()
        );
    }
}
