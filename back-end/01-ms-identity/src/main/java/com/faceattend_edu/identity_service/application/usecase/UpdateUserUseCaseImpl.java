package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.UpdateUserUseCase;
import com.faceattend_edu.identity_service.application.port.out.UpdateUserPort;
import com.faceattend_edu.identity_service.domain.model.User;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@RequiredArgsConstructor
public class UpdateUserUseCaseImpl implements UpdateUserUseCase {

    private final UpdateUserPort updateUserPort;

    @Override
    public void updateUser(User user) {
        user.validate();
        user.setUpdatedAt(LocalDateTime.now());
        updateUserPort.updateUser(user);
    }
}
