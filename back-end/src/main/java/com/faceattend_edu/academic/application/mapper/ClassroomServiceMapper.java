package com.faceattend_edu.academic.application.mapper;

import com.faceattend_edu.academic.domain.dto.patch.ClassroomPatch;
import com.faceattend_edu.academic.domain.dto.request.ClassroomRequest;
import com.faceattend_edu.academic.domain.dto.response.ClassroomResponse;
import com.faceattend_edu.academic.domain.model.Classroom;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClassroomServiceMapper
        extends AbstractServiceMapper<Classroom, ClassroomRequest, ClassroomResponse, ClassroomPatch> {

    @Override
    @Mapping(source = "schoolId", target = "school.id")
    Classroom toDomain(ClassroomRequest classroomRequest);
}
