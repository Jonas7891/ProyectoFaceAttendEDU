package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.EnrollmentPatch;
import com.faceattend_edu.newModule.domain.dto.request.EnrollmentRequest;
import com.faceattend_edu.newModule.domain.dto.response.EnrollmentResponse;
import com.faceattend_edu.newModule.domain.model.Enrollment;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EnrollmentServiceMapper
        extends AbstractServiceMapper<Enrollment, EnrollmentRequest, EnrollmentResponse, EnrollmentPatch> {
}
