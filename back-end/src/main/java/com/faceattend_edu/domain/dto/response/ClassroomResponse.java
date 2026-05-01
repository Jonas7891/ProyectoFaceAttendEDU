package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.School;

public record ClassroomResponse(
        Integer id,
        SchoolResponse school,
        String classroomName
) {
}