package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.adapter.out.messaging.DomainEventPublisher;
import com.faceattend_edu.identity_service.application.port.in.ResetPasswordUseCase;
import com.faceattend_edu.identity_service.application.port.out.HashPasswordPort;
import com.faceattend_edu.identity_service.application.port.in.ValidatePasswordPolicyUseCase;
import com.faceattend_edu.identity_service.application.port.out.LoadUserByIdentifierPort;
import com.faceattend_edu.identity_service.application.port.out.LoadUserSessionsPort;
import com.faceattend_edu.identity_service.application.port.out.RecoveryCodePort;
import com.faceattend_edu.identity_service.application.port.out.UpdateUserPort;
import com.faceattend_edu.identity_service.application.port.out.UpdateUserSessionPort;
import com.faceattend_edu.identity_service.domain.exception.UnauthorizedException;
import com.faceattend_edu.identity_service.domain.exception.ValidationException;
import com.faceattend_edu.identity_service.domain.model.User;
import com.faceattend_edu.identity_service.domain.model.UserSession;
import com.faceattend_edu.identity_service.shared.util.Emails;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ResetPasswordUseCaseImpl implements ResetPasswordUseCase {

    private static final Logger log = LoggerFactory.getLogger(ResetPasswordUseCaseImpl.class);

    private final LoadUserByIdentifierPort loadUserByIdentifierPort;
    private final RecoveryCodePort recoveryCodePort;
    private final UpdateUserPort updateUserPort;
    private final HashPasswordPort hashPasswordPort;
    private final ValidatePasswordPolicyUseCase validatePasswordPolicy;
    private final LoadUserSessionsPort loadUserSessionsPort;
    private final UpdateUserSessionPort updateUserSessionPort;
    private final DomainEventPublisher eventPublisher;

    @Override
    @Transactional
    public void resetPassword(String email, String rawPassword) {
        if (!Emails.isWellFormed(email)) {
            throw new ValidationException("A valid email is required");
        }
        String address = Emails.normalize(email);
        String password = rawPassword == null ? "" : rawPassword;
        if (password.isBlank()) {
            throw new ValidationException("Password is required");
        }

        // La política se valida ANTES de consumir el reto: una contraseña mal
        // formada no debe obligar al usuario a repetir todo el flujo.
        validatePasswordPolicy.validate(password);

        // Uso único: el reto se gasta aquí, y solo existe reto si /verify-code
        // lo marcó como verificado. Un reset sin verificar devuelve siempre 401,
        // exista o no la cuenta (sin enumeración).
        if (!recoveryCodePort.consumeVerified(address)) {
            throw new UnauthorizedException("Verification code required");
        }

        User user = loadUserByIdentifierPort.loadUserByIdentifier(address);
        if (user == null || !user.isActive()) {
            throw new UnauthorizedException("Verification code required");
        }

        user.setPasswordHash(hashPasswordPort.hash(password));
        user.setMustChangePassword(false);
        user.setUpdatedAt(LocalDateTime.now());
        updateUserPort.updateUser(user);

        int closed = closeActiveSessions(user.getUserId());

        eventPublisher.publish("identity-events",
                "{\"type\":\"PasswordChanged\",\"userId\":\"" + user.getUserId()
                        + "\",\"occurredAt\":\"" + Instant.now() + "\"}");
        log.info("Password reset for userId={} activeSessionsClosed={}", user.getUserId(), closed);
    }

    /** Cambiar la credencial invalida todo lo que esté vivo del usuario. */
    private int closeActiveSessions(java.util.UUID userId) {
        List<UserSession> sessions = loadUserSessionsPort.loadUserSessions(userId);
        int closed = 0;
        for (UserSession session : sessions) {
            if (session.isActive()) {
                session.end();
                updateUserSessionPort.updateUserSession(session);
                closed++;
            }
        }
        return closed;
    }
}
