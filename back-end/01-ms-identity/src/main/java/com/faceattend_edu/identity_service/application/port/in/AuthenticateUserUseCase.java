package com.faceattend_edu.identity_service.application.port.in;

import com.faceattend_edu.identity_service.domain.model.UserSession;

public interface AuthenticateUserUseCase {
    UserSession authenticate(String username, String password);
}
