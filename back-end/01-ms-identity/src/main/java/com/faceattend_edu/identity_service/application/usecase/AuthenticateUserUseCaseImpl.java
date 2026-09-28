package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.AuthenticateUserUseCase;
import com.faceattend_edu.identity_service.application.port.out.HashPasswordPort;
import com.faceattend_edu.identity_service.application.port.out.LoadUserByUsernamePort;
import com.faceattend_edu.identity_service.application.port.out.SaveUserSessionPort;
import com.faceattend_edu.identity_service.application.port.out.UpdateUserPort;
import com.faceattend_edu.identity_service.domain.exception.UnauthorizedException;
import com.faceattend_edu.identity_service.domain.model.User;
import com.faceattend_edu.identity_service.domain.model.UserSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class AuthenticateUserUseCaseImpl implements AuthenticateUserUseCase {

    private final LoadUserByUsernamePort loadUserByUsernamePort;
    private final SaveUserSessionPort saveUserSessionPort;
    private final UpdateUserPort updateUserPort;
    private final HashPasswordPort hashPasswordPort;

    @Override
    @Transactional
    public UserSession authenticate(String username, String password) {
        User user = username == null ? null : loadUserByUsernamePort.loadUserByUsername(username);

        if (user == null || !user.isActive() || !hashPasswordPort.matches(password, user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        user.touchLastAccess();
        updateUserPort.updateUser(user);

        UserSession session = new UserSession();
        session.setUserId(user);
        session.start();

        return saveUserSessionPort.saveUserSession(session);
    }
}
