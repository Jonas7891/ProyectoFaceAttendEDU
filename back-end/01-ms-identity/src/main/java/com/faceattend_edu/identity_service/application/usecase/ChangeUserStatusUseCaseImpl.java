package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.ChangeUserStatusUseCase;
import com.faceattend_edu.identity_service.application.port.out.LoadUserPort;
import com.faceattend_edu.identity_service.application.port.out.UpdateUserPort;
import com.faceattend_edu.identity_service.domain.model.User;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@RequiredArgsConstructor
public class ChangeUserStatusUseCaseImpl implements ChangeUserStatusUseCase {

    private final LoadUserPort loadUserPort;
    private final UpdateUserPort updateUserPort;

    @Override
    public void changeStatus(UUID userId, boolean status) {
        User user = loadUserPort.loadUser(userId);
        user.setStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        updateUserPort.updateUser(user);
    }
}
