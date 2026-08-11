package com.faceattend_edu.academic.application.mapper;

import com.faceattend_edu.academic.domain.dto.patch.CoursePatch;
import com.faceattend_edu.academic.domain.dto.request.CourseRequest;
import com.faceattend_edu.academic.domain.dto.response.CourseResponse;
import com.faceattend_edu.academic.domain.model.Course;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CourseServiceMapper
        extends AbstractServiceMapper<Course, CourseRequest, CourseResponse, CoursePatch> {

    @Override
    @Mapping(source = "schoolId", target = "school.id")
    Course toDomain(CourseRequest courseRequest);
}
