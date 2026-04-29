package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.CourseRequest;
import com.faceattend_edu.domain.dto.response.CourseResponse;
import com.faceattend_edu.domain.model.Course;
import org.springframework.stereotype.Component;

@Component
public class CourseServiceMapper {

    public Course toDomain(CourseRequest request) {
        return new Course(
                null,
                request.school(),
                request.courseName(),
                request.courseCode()
        );
    }

    public CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getSchool(),
                course.getCourseName(),
                course.getCourseCode()
        );
    }
}
