package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.SchedulePatch;
import com.faceattend_edu.newModule.domain.dto.request.ScheduleRequest;
import com.faceattend_edu.newModule.domain.dto.response.ScheduleResponse;
import com.faceattend_edu.newModule.domain.model.Schedule;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ScheduleServiceMapper
        extends AbstractServiceMapper<Schedule, ScheduleRequest, ScheduleResponse, SchedulePatch> {
}
