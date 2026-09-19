package com.faceattend_edu.identity_service.application.port.in;

import com.faceattend_edu.identity_service.domain.model.School;
import java.util.UUID;

public interface GetSchoolUseCase {
    School getSchool(UUID schoolId);
}
