package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.GetUserSessionUseCase;
import com.faceattend_edu.identity_service.application.port.out.LoadUserSessionPort;
import com.faceattend_edu.identity_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.identity_service.domain.model.UserSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@RequiredArgsConstructor
@Service
public class GetUserSessionUseCaseImpl implements GetUserSessionUseCase {

    private final LoadUserSessionPort loadUserSessionPort;

    @Override
    public UserSession getUserSession(UUID sessionId) {
        UserSession session = loadUserSessionPort.loadUserSession(sessionId);
        if (session == null) {
            throw new EntityNotFoundException("UserSession", sessionId);
        }
        return session;
    }
}
