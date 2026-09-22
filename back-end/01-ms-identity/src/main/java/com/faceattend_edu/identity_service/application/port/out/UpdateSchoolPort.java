package com.faceattend_edu.identity_service.application.port.out;

import com.faceattend_edu.identity_service.domain.model.School;

public interface UpdateSchoolPort {
    void updateSchool(School school);
}
