package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.CreateUserUseCase;
import com.faceattend_edu.identity_service.application.port.out.SaveUserPort;
import com.faceattend_edu.identity_service.domain.model.User;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@RequiredArgsConstructor
public class CreateUserUseCaseImpl implements CreateUserUseCase {

    private final SaveUserPort saveUserPort;

    @Override
    public User createUser(User user) {
        user.validate();
        user.setStatus(true);
        user.setCreatedAt(LocalDateTime.now());
        return saveUserPort.saveUser(user);
    }
}
