package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.CourseRequest;
import com.faceattend_edu.domain.dto.response.CourseResponse;
import com.faceattend_edu.domain.model.Course;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public Course toDomain(CourseRequest request) {
        return new Course(
                null,
                request.idSchool(),
                request.courseName(),
                request.courseCode()
        );
    }

    public CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getIdSchool(),
                course.getCourseName(),
                course.getCourseCode()
        );
    }
}
