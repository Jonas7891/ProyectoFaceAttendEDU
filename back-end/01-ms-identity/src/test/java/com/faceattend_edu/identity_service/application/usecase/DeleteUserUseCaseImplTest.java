package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.out.CloseUserSessionsPort;
import com.faceattend_edu.identity_service.application.port.out.LoadUserPort;
import com.faceattend_edu.identity_service.application.port.out.SoftDeleteUserPort;
import com.faceattend_edu.identity_service.application.port.out.UserProvisioningPort;
import com.faceattend_edu.identity_service.domain.exception.DownstreamRejectedException;
import com.faceattend_edu.identity_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.identity_service.domain.exception.ForbiddenException;
import com.faceattend_edu.identity_service.domain.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** AUD-74 / AUD-30: deleting an account is a soft delete that also withdraws sessions and roles. */
@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
@DisplayName("Soft delete of a user account")
class DeleteUserUseCaseImplTest {

    private static final String TOKEN = "11111111-2222-3333-4444-555555555555";

    @Mock LoadUserPort loadUser;
    @Mock SoftDeleteUserPort softDelete;
    @Mock CloseUserSessionsPort closeSessions;
    @Mock UserProvisioningPort provisioning;
    @InjectMocks DeleteUserUseCaseImpl useCase;

    private final UUID userId = UUID.randomUUID();
    private final UUID caller = UUID.randomUUID();

    private void existingUser() {
        User user = new User();
        user.setUserId(userId);
        when(loadUser.loadUser(userId)).thenReturn(user);
    }

    @Test
    @DisplayName("withdraws every role, closes the sessions and marks the row deleted by the caller, in that order")
    void deletesInOrder() {
        existingUser();
        when(provisioning.listRoleNames(TOKEN, userId)).thenReturn(List.of("Instructor", "Aprendiz"));
        when(softDelete.softDeleteUser(eq(userId), eq(caller), any(LocalDateTime.class))).thenReturn(1);

        useCase.deleteUser(userId, caller, TOKEN);

        InOrder order = inOrder(provisioning, closeSessions, softDelete);
        order.verify(provisioning).removeRole(TOKEN, userId, "Instructor");
        order.verify(provisioning).removeRole(TOKEN, userId, "Aprendiz");
        order.verify(closeSessions).closeActiveSessionsOfUser(eq(userId), any(LocalDateTime.class));
        order.verify(softDelete).softDeleteUser(eq(userId), eq(caller), any(LocalDateTime.class));
        verify(provisioning, never()).assignRole(anyString(), any(), anyString());
    }

    @Test
    @DisplayName("nobody deletes their own account")
    void refusesSelfDelete() {
        assertThatThrownBy(() -> useCase.deleteUser(userId, userId, TOKEN)).isInstanceOf(ForbiddenException.class);
        verifyNoInteractions(loadUser, provisioning, closeSessions, softDelete);
    }

    @Test
    @DisplayName("an unknown user is a 404 and nothing is touched")
    void unknownUser() {
        when(loadUser.loadUser(userId)).thenReturn(null);
        assertThatThrownBy(() -> useCase.deleteUser(userId, caller, TOKEN)).isInstanceOf(EntityNotFoundException.class);
        verifyNoInteractions(provisioning, closeSessions, softDelete);
    }

    @Test
    @DisplayName("a role that cannot be withdrawn aborts the delete and puts back the roles already withdrawn")
    void roleFailureLeavesTheAccountWhole() {
        existingUser();
        when(provisioning.listRoleNames(TOKEN, userId)).thenReturn(List.of("Instructor", "Administrador"));
        doThrow(new DownstreamRejectedException(403, "no")).when(provisioning).removeRole(eq(TOKEN), eq(userId), eq("Administrador"));

        assertThatThrownBy(() -> useCase.deleteUser(userId, caller, TOKEN)).isInstanceOf(DownstreamRejectedException.class);

        verify(provisioning).assignRole(TOKEN, userId, "Instructor");
        verify(provisioning).assignRole(TOKEN, userId, "Administrador");
        verifyNoInteractions(closeSessions, softDelete);
    }

    @Test
    @DisplayName("if marking the row fails after the roles were withdrawn, the roles come back")
    void persistenceFailureRestoresRoles() {
        existingUser();
        when(provisioning.listRoleNames(TOKEN, userId)).thenReturn(List.of("Instructor"));
        when(softDelete.softDeleteUser(eq(userId), eq(caller), any(LocalDateTime.class))).thenThrow(new IllegalStateException("db down"));

        assertThatThrownBy(() -> useCase.deleteUser(userId, caller, TOKEN)).isInstanceOf(IllegalStateException.class);

        verify(provisioning).assignRole(TOKEN, userId, "Instructor");
    }

    @Test
    @DisplayName("a failed restore never hides the original error")
    void restoreFailureKeepsTheOriginalError() {
        existingUser();
        when(provisioning.listRoleNames(TOKEN, userId)).thenReturn(List.of("Instructor"));
        when(softDelete.softDeleteUser(eq(userId), eq(caller), any(LocalDateTime.class))).thenThrow(new IllegalStateException("db down"));
        doThrow(new RuntimeException("authorization down")).when(provisioning).assignRole(TOKEN, userId, "Instructor");

        assertThatThrownBy(() -> useCase.deleteUser(userId, caller, TOKEN))
                .isInstanceOf(IllegalStateException.class).hasMessage("db down");
    }

    @Test
    @DisplayName("an already deleted user still gets its leftover roles withdrawn, and answers 404 without restoring them")
    void alreadyDeletedStillCleansLeftoverRoles() {
        existingUser();
        when(provisioning.listRoleNames(TOKEN, userId)).thenReturn(List.of("Aprendiz"));
        when(softDelete.softDeleteUser(eq(userId), eq(caller), any(LocalDateTime.class))).thenReturn(0);

        assertThatThrownBy(() -> useCase.deleteUser(userId, caller, TOKEN)).isInstanceOf(EntityNotFoundException.class);

        verify(provisioning).removeRole(TOKEN, userId, "Aprendiz");
        verify(provisioning, never()).assignRole(anyString(), any(), anyString());
    }
}
