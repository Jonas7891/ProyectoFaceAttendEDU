package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.AuthenticateUserUseCase;
import com.faceattend_edu.identity_service.application.port.out.LoadUserByUsernamePort;
import com.faceattend_edu.identity_service.application.port.out.SaveUserSessionPort;
import com.faceattend_edu.identity_service.domain.exception.UnauthorizedException;
import com.faceattend_edu.identity_service.domain.model.User;
import com.faceattend_edu.identity_service.domain.model.UserSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuthenticateUserUseCaseImpl implements AuthenticateUserUseCase {

    private final LoadUserByUsernamePort loadUserByUsernamePort;
    private final SaveUserSessionPort saveUserSessionPort;

    @Override
    public UserSession authenticate(String username, String password) {
        User user = loadUserByUsernamePort.loadUserByUsername(username);

        if (user == null || !user.isActive() || !verifyPassword(password, user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        UserSession session = new UserSession();
        session.setUserId(user);
        session.start();

        saveUserSessionPort.saveUserSession(session);
        return session;
    }

    private boolean verifyPassword(String rawPassword, String storedHash) {
        // En una implementación real, se usaría un PasswordEncoder (BCrypt, etc.)
        return storedHash != null && storedHash.equals(rawPassword);
    }
}
