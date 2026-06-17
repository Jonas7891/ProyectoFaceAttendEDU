package com.faceattend_edu.domain.dto.response;

public record CourseResponse(
        Integer id,
        SchoolResponse school,
        String courseName,
        String courseCode
) {
}