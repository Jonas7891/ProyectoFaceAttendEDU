package com.faceattend_edu.identity_service.application.port.in;

import com.faceattend_edu.identity_service.domain.model.School;

public interface CreateSchoolUseCase {
    School createSchool(School school);
}
