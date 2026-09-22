package com.faceattend_edu.identity_service.application.port.out;

import com.faceattend_edu.identity_service.domain.model.School;

public interface SaveSchoolPort {
    School saveSchool(School school);
}
