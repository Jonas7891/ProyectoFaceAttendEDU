package com.faceattend_edu.domain.dto.response;

public record ClassroomResponse(
        Integer id,
        SchoolResponse school,
        String classroomName
) {
}