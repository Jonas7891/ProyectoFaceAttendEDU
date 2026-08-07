package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.ClassroomRequest;
import com.faceattend_edu.domain.dto.response.ClassroomResponse;
import com.faceattend_edu.domain.model.Classroom;
import com.faceattend_edu.domain.model.School;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class ClassroomServiceMapper {

    private final SchoolServiceMapper schoolServiceMapper;

    public Classroom toDomain(ClassroomRequest request,
                              School school) {
        return new Classroom(
                null,
                school,
                request.classroomName()
        );
    }

    public ClassroomResponse toResponse(Classroom classroom) {
        return new ClassroomResponse(
                classroom.getId(),
                schoolServiceMapper.toResponse(classroom.getSchool()),
                classroom.getClassroomName()
        );
    }
}
