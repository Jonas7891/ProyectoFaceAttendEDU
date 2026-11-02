package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.DeleteUserUseCase;
import com.faceattend_edu.identity_service.application.port.out.CloseUserSessionsPort;
import com.faceattend_edu.identity_service.application.port.out.LoadUserPort;
import com.faceattend_edu.identity_service.application.port.out.SoftDeleteUserPort;
import com.faceattend_edu.identity_service.application.port.out.UserProvisioningPort;
import com.faceattend_edu.identity_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.identity_service.domain.exception.ForbiddenException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Order matters: roles first (the only step that can be refused by another service, and one that
 * can be put back), then the sessions (a closed session cannot be revived by a rollback, but a
 * user who must log in again loses nothing), and the row last. A failure at any point puts back
 * the roles already withdrawn, best effort: if authorization is down at that moment too, the
 * account keeps working minus those roles and the error still reaches the caller to retry.
 *
 * <p>Deleting a user that is already deleted still withdraws any role left behind (the 43 rows of
 * AUD-30 predate this use case) and then answers 404; those roles are not put back.</p>
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class DeleteUserUseCaseImpl implements DeleteUserUseCase {

    private final LoadUserPort loadUserPort;
    private final SoftDeleteUserPort softDeleteUserPort;
    private final CloseUserSessionsPort closeUserSessionsPort;
    private final UserProvisioningPort provisioning;

    @Override
    public void deleteUser(UUID userId, UUID callerUserId, String token) {
        if (userId.equals(callerUserId)) {
            throw new ForbiddenException("You cannot delete your own account");
        }
        if (loadUserPort.loadUser(userId) == null) {
            throw new EntityNotFoundException("User", userId);
        }

        List<String> withdrawn = new ArrayList<>();
        int rows;
        try {
            for (String role : provisioning.listRoleNames(token, userId)) {
                // Added before the call: a timeout does not mean the role is still there, and
                // assigning it again is harmless (409 = already assigned).
                withdrawn.add(role);
                provisioning.removeRole(token, userId, role);
            }
            LocalDateTime now = LocalDateTime.now();
            closeUserSessionsPort.closeActiveSessionsOfUser(userId, now);
            rows = softDeleteUserPort.softDeleteUser(userId, callerUserId, now);
        } catch (RuntimeException ex) {
            restoreRoles(token, userId, withdrawn);
            throw ex;
        }
        if (rows == 0) {
            throw new EntityNotFoundException("User", userId);
        }
    }

    private void restoreRoles(String token, UUID userId, List<String> roles) {
        for (String role : roles) {
            try {
                provisioning.assignRole(token, userId, role);
            } catch (RuntimeException ex) {
                log.error("Could not put back role {} of user {} after a failed delete: {}", role, userId, ex.getMessage());
            }
        }
    }
}
