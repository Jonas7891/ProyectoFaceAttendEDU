package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.ScheduleRequest;
import com.faceattend_edu.domain.dto.response.ScheduleResponse;
import com.faceattend_edu.domain.model.Schedule;
import org.springframework.stereotype.Component;

@Component
public class ScheduleServiceMapper {

    public Schedule toDomain(ScheduleRequest request) {
        return new Schedule(
                null,
                request.period(),
                request.course(),
                request.teacher(),
                request.classroom(),
                request.day(),
                request.startTime(),
                request.endTime()
        );
    }

    public ScheduleResponse toResponse(Schedule schedule) {
        return new ScheduleResponse(
                schedule.getId(),
                schedule.getPeriod(),
                schedule.getCourse(),
                schedule.getTeacher(),
                schedule.getClassroom(),
                schedule.getDay(),
                schedule.getStartTime(),
                schedule.getEndTime()
        );
    }
}
