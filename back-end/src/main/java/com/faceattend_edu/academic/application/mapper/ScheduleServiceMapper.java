package com.faceattend_edu.academic.application.mapper;

import com.faceattend_edu.academic.domain.dto.patch.SchedulePatch;
import com.faceattend_edu.academic.domain.dto.request.ScheduleRequest;
import com.faceattend_edu.academic.domain.dto.response.ScheduleResponse;
import com.faceattend_edu.academic.domain.model.Schedule;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ScheduleServiceMapper
        extends AbstractServiceMapper<Schedule, ScheduleRequest, ScheduleResponse, SchedulePatch> {

    @Override
    @Mapping(source = "periodId", target = "period.id")
    @Mapping(source = "courseId", target = "course.id")
    @Mapping(source = "teacherId", target = "teacher.id")
    @Mapping(source = "classroomId", target = "classroom.id")
    Schedule toDomain(ScheduleRequest scheduleRequest);
}
