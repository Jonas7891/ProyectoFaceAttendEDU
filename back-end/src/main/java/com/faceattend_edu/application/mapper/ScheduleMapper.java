package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.ScheduleRequest;
import com.faceattend_edu.domain.dto.response.ScheduleResponse;
import com.faceattend_edu.domain.model.Schedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ScheduleMapper {

    public Schedule toDomain(ScheduleRequest request) {
        return new Schedule(
                null,
                request.idPeriod(),
                request.idCourse(),
                request.idTeacher(),
                request.idClassroom(),
                request.day(),
                request.startTime(),
                request.endTime()
        );
    }

    public ScheduleResponse toResponse(Schedule schedule) {
        return new ScheduleResponse(
                schedule.getId(),
                schedule.getIdPeriod(),
                schedule.getIdCourse(),
                schedule.getIdTeacher(),
                schedule.getIdClassroom(),
                schedule.getDay(),
                schedule.getStartTime(),
                schedule.getEndTime()
        );
    }
}
