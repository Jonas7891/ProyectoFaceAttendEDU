package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.CourseRequest;
import com.faceattend_edu.domain.dto.response.CourseResponse;
import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.domain.model.School;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class CourseServiceMapper {

    private final SchoolServiceMapper schoolServiceMapper;

    public Course toDomain(CourseRequest request,
                           School school) {
        return new Course(
                null,
                school,
                request.courseName(),
                request.courseCode()
        );
    }

    public CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                schoolServiceMapper.toResponse(course.getSchool()),
                course.getCourseName(),
                course.getCourseCode()
        );
    }
}
