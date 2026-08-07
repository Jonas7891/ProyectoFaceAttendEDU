package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.ScheduleRequest;
import com.faceattend_edu.domain.dto.response.ScheduleResponse;
import com.faceattend_edu.domain.model.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class ScheduleServiceMapper {

    private final PeriodServiceMapper periodServiceMapper;
    private final CourseServiceMapper courseServiceMapper;
    private final PersonServiceMapper teacherServiceMapper;
    private final ClassroomServiceMapper classroomServiceMapper;

    public Schedule toDomain(ScheduleRequest request,
                             Period period,
                             Course course,
                             Person teacher,
                             Classroom classroom) {
        return new Schedule(
                null,
                period,
                course,
                teacher,
                classroom,
                request.day(),
                request.startTime(),
                request.endTime()
        );
    }

    public ScheduleResponse toResponse(Schedule schedule) {
        return new ScheduleResponse(
                schedule.getId(),
                periodServiceMapper.toResponse(schedule.getPeriod()),
                courseServiceMapper.toResponse(schedule.getCourse()),
                teacherServiceMapper.toResponse(schedule.getTeacher()),
                classroomServiceMapper.toResponse(schedule.getClassroom()),
                schedule.getDay(),
                schedule.getStartTime(),
                schedule.getEndTime()
        );
    }
}
