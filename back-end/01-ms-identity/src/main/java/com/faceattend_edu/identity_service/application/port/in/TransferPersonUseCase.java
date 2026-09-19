package com.faceattend_edu.identity_service.application.port.in;

import java.util.UUID;

public interface TransferPersonUseCase {
    void transferPerson(UUID personId, UUID newSchoolId);
}
