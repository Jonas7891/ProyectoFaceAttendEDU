package com.faceattend_edu.identity_service.application.port.in;

import java.util.UUID;

public interface ChangeSchoolStatusUseCase {
    void changeStatus(UUID schoolId, boolean status);
}
