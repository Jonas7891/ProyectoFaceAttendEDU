package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.CoursePatch;
import com.faceattend_edu.newModule.domain.dto.request.CourseRequest;
import com.faceattend_edu.newModule.domain.dto.response.CourseResponse;
import com.faceattend_edu.newModule.domain.model.Course;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseServiceMapper
        extends AbstractServiceMapper<Course, CourseRequest, CourseResponse, CoursePatch> {
}
