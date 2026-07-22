package com.faceattend_edu.newModule.domain.dto.response;

public record ClassroomResponse(
        Integer id,
        SchoolResponse school,
        String classroomName
) {
}