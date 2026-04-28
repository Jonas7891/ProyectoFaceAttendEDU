package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.School;

public record CourseResponse(
        Integer id,
        School school,
        String courseName,
        String courseCode
) {
}