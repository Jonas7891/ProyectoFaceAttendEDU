package com.faceattend_edu.authorization_service.application.usecase;

import com.faceattend_edu.authorization_service.application.access.RoleAssignmentPolicy;
import com.faceattend_edu.authorization_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.authorization_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.authorization_service.domain.exception.ForbiddenException;
import com.faceattend_edu.authorization_service.domain.exception.ValidationException;
import com.faceattend_edu.authorization_service.domain.model.Caller;
import com.faceattend_edu.authorization_service.domain.model.Role;
import com.faceattend_edu.authorization_service.domain.model.UserRole;
import com.faceattend_edu.authorization_service.domain.port.out.RolePermissionRepository;
import com.faceattend_edu.authorization_service.domain.port.out.RoleRepository;
import com.faceattend_edu.authorization_service.domain.port.out.UserRoleRepository;
import com.faceattend_edu.authorization_service.domain.port.out.UserSchoolsPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssignRoleToUserUseCaseImplTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final Caller SUPER_ADMIN = new Caller(null, List.of(Caller.SUPER_ADMIN));
    private static final Caller SCHOOL_ADMIN = new Caller("admin-1", List.of(Caller.SCHOOL_ADMIN));

    @Mock RoleRepository roleRepository;
    @Mock UserRoleRepository userRoleRepository;
    @Mock UserSchoolsPort userSchools;

    private AssignRoleToUserUseCaseImpl useCase;

    @BeforeEach
    void setUp() {
        useCase = new AssignRoleToUserUseCaseImpl(roleRepository, userRoleRepository,
                new RoleAssignmentPolicy(roleRepository, userSchools));
    }

    private static Role role(String name) {
        Role r = new Role();
        r.setRoleName(name);
        return r;
    }

    @Test
    void assignsTheRoleWhenItExistsAndIsNotAlreadyAssigned() {
        when(roleRepository.existsById(1)).thenReturn(true);
        when(userRoleRepository.exists(USER_ID, 1)).thenReturn(false);

        useCase.assignRoleToUser(SUPER_ADMIN, USER_ID, 1);

        ArgumentCaptor<UserRole> captor = ArgumentCaptor.forClass(UserRole.class);
        verify(userRoleRepository).save(captor.capture());
        assertEquals(USER_ID, captor.getValue().getUserId());
        assertEquals(1, captor.getValue().getRoleId());
    }

    @Test
    void throwsWhenTheRoleDoesNotExist() {
        when(roleRepository.existsById(999)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> useCase.assignRoleToUser(SUPER_ADMIN, USER_ID, 999));

        verify(userRoleRepository, never()).save(any());
    }

    @Test
    void rejectsAssigningTheSameRoleTwice() {
        when(roleRepository.existsById(1)).thenReturn(true);
        when(userRoleRepository.exists(USER_ID, 1)).thenReturn(true);

        assertThrows(DuplicateEntityException.class, () -> useCase.assignRoleToUser(SUPER_ADMIN, USER_ID, 1));

        verify(userRoleRepository, never()).save(any());
    }

    @Test
    void removesTheRoleWhenTheAssignmentExists() {
        when(userRoleRepository.exists(USER_ID, 1)).thenReturn(true);

        useCase.removeRoleFromUser(SUPER_ADMIN, USER_ID, 1);

        verify(userRoleRepository).delete(USER_ID, 1);
    }

    @Test
    void throwsWhenRemovingAnAssignmentThatDoesNotExist() {
        when(userRoleRepository.exists(USER_ID, 1)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> useCase.removeRoleFromUser(SUPER_ADMIN, USER_ID, 1));

        verify(userRoleRepository, never()).delete(USER_ID, 1);
    }

    @Test
    void aSchoolAdministratorGrantsOperationalRolesToUsersOfTheirSchool() {
        when(roleRepository.findById(3)).thenReturn(Optional.of(role("Aprendiz")));
        when(roleRepository.existsById(3)).thenReturn(true);
        when(userSchools.schoolsOf("admin-1")).thenReturn(Set.of(7, 8));
        when(userSchools.schoolsOf(USER_ID.toString())).thenReturn(Set.of(8));

        useCase.assignRoleToUser(SCHOOL_ADMIN, USER_ID, 3);

        verify(userRoleRepository).save(any());
    }

    @Test
    void aSchoolAdministratorNeverGrantsOrTakesAPrivilegedRole() {
        when(roleRepository.findById(1)).thenReturn(Optional.of(role(Caller.SUPER_ADMIN)));
        when(roleRepository.findById(2)).thenReturn(Optional.of(role(Caller.SCHOOL_ADMIN)));

        assertThrows(ForbiddenException.class, () -> useCase.assignRoleToUser(SCHOOL_ADMIN, USER_ID, 1));
        assertThrows(ForbiddenException.class, () -> useCase.removeRoleFromUser(SCHOOL_ADMIN, USER_ID, 2));

        verify(userRoleRepository, never()).save(any());
        verify(userRoleRepository, never()).delete(any(), any());
    }

    @Test
    void aSchoolAdministratorCannotTouchUsersOfAnotherSchoolOrActWithoutOne() {
        when(roleRepository.findById(3)).thenReturn(Optional.of(role("Instructor")));
        when(userSchools.schoolsOf("admin-1")).thenReturn(Set.of(7));
        when(userSchools.schoolsOf(USER_ID.toString())).thenReturn(Set.of(9));
        assertThrows(ForbiddenException.class, () -> useCase.assignRoleToUser(SCHOOL_ADMIN, USER_ID, 3));

        when(userSchools.schoolsOf("admin-1")).thenReturn(Collections.emptySet());
        assertThrows(ForbiddenException.class, () -> useCase.removeRoleFromUser(SCHOOL_ADMIN, USER_ID, 3));

        Caller anonymous = new Caller(null, List.of(Caller.SCHOOL_ADMIN));
        assertThrows(ForbiddenException.class, () -> useCase.assignRoleToUser(anonymous, USER_ID, 3));

        verify(userRoleRepository, never()).save(any());
        verify(userRoleRepository, never()).delete(any(), any());
    }

    @Test
    void userRolesAreReadSingleOrInBoundedBatches() {
        GetUserRolesUseCaseImpl roles = new GetUserRolesUseCaseImpl(userRoleRepository);
        when(userRoleRepository.findRolesByUserId(USER_ID)).thenReturn(List.of(role("Aprendiz")));
        assertEquals(1, roles.rolesOf(USER_ID).size());

        assertTrue(roles.rolesOf(List.of()).isEmpty());
        assertTrue(roles.rolesOf((List<UUID>) null).isEmpty());
        List<UUID> tooMany = IntStream.range(0, 301).mapToObj(i -> UUID.randomUUID()).toList();
        assertThrows(ValidationException.class, () -> roles.rolesOf(tooMany));
        verify(userRoleRepository, never()).findRolesByUserIds(any());
    }

    @Test
    void permissionsOfAMissingRoleAre404() {
        RolePermissionRepository rolePermissions = mock(RolePermissionRepository.class);
        GetRolePermissionsUseCaseImpl permissions = new GetRolePermissionsUseCaseImpl(roleRepository, rolePermissions);
        when(roleRepository.existsById(9)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> permissions.permissionsOf(9));
        verify(rolePermissions, never()).findPermissionsByRoleId(9);
    }
}
