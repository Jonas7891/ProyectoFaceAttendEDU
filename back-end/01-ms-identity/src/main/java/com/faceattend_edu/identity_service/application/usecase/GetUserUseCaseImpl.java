package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.GetUserUseCase;
import com.faceattend_edu.identity_service.application.port.out.LoadUserPort;
import com.faceattend_edu.identity_service.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@RequiredArgsConstructor
@Service
public class GetUserUseCaseImpl implements GetUserUseCase {

    private final LoadUserPort loadUserPort;

    @Override
    public User getUser(UUID userId) {
        return loadUserPort.loadUser(userId);
    }
}
