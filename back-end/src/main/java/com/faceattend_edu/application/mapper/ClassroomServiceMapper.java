package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.ClassroomRequest;
import com.faceattend_edu.domain.dto.response.ClassroomResponse;
import com.faceattend_edu.domain.model.Classroom;
import org.springframework.stereotype.Component;

@Component
public class ClassroomServiceMapper {

    public Classroom toDomain(ClassroomRequest request) {
        return new Classroom(
                null,
                request.school(),
                request.classroomName()
        );
    }

    public ClassroomResponse toResponse(Classroom classroom) {
        return new ClassroomResponse(
                classroom.getId(),
                classroom.getSchool(),
                classroom.getClassroomName()
        );
    }
}
