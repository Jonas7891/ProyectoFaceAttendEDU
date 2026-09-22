package com.faceattend_edu.identity_service.application.port.out;

import com.faceattend_edu.identity_service.domain.model.UserSession;

public interface SaveUserSessionPort {
    void saveUserSession(UserSession session);
}
