package com.faceattend_edu.identity_service.application.port.out;

import com.faceattend_edu.identity_service.domain.model.School;
import java.util.UUID;

public interface LoadSchoolPort {
    School loadSchool(UUID schoolId);
}
