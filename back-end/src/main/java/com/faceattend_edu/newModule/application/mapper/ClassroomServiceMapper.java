package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.ClassroomPatch;
import com.faceattend_edu.newModule.domain.dto.patch.SchoolPatch;
import com.faceattend_edu.newModule.domain.dto.request.ClassroomRequest;
import com.faceattend_edu.newModule.domain.dto.request.SchoolRequest;
import com.faceattend_edu.newModule.domain.dto.response.ClassroomResponse;
import com.faceattend_edu.newModule.domain.dto.response.SchoolResponse;
import com.faceattend_edu.newModule.domain.model.Classroom;
import com.faceattend_edu.newModule.domain.model.School;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClassroomServiceMapper
        extends AbstractServiceMapper<Classroom, ClassroomRequest, ClassroomResponse, ClassroomPatch> {
}
