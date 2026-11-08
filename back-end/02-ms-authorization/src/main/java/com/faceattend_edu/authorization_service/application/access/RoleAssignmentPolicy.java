package com.faceattend_edu.authorization_service.application.access;

import com.faceattend_edu.authorization_service.domain.exception.ForbiddenException;
import com.faceattend_edu.authorization_service.domain.model.Caller;
import com.faceattend_edu.authorization_service.domain.port.out.RoleRepository;
import com.faceattend_edu.authorization_service.domain.port.out.UserSchoolsPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;

/**
 * Who may grant or take a role. Super Administrador may change any role of anyone. A school
 * Administrador only changes operational roles (neither Super Administrador nor Administrador),
 * and only for users who share a school with them. The schools come from each user's
 * academic_actor, never from the request body.
 */
@Component
@RequiredArgsConstructor
public class RoleAssignmentPolicy {

    private static final Set<String> PRIVILEGED_ROLE_NAMES = Set.of(Caller.SUPER_ADMIN, Caller.SCHOOL_ADMIN);

    private final RoleRepository roles;
    private final UserSchoolsPort userSchools;

    public void requireMayChangeRole(Caller caller, UUID targetUserId, Integer roleId) {
        if (caller.isSuperAdmin()) return;
        boolean privileged = roles.findById(roleId)
                .map(role -> PRIVILEGED_ROLE_NAMES.contains(role.getRoleName()))
                .orElse(false);
        if (privileged) throw new ForbiddenException("Only Super Administrador can change this role");
        if (caller.userId() == null) throw new ForbiddenException("The caller is not identified");
        Set<Integer> callerSchools = userSchools.schoolsOf(caller.userId());
        if (callerSchools.isEmpty() || Collections.disjoint(callerSchools, userSchools.schoolsOf(targetUserId.toString()))) {
            throw new ForbiddenException("The user is not in one of your schools");
        }
    }
}
