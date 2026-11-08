package com.faceattend_edu.authorization_service.application.usecase;

import com.faceattend_edu.authorization_service.application.access.RoleAssignmentPolicy;
import com.faceattend_edu.authorization_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.authorization_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.authorization_service.domain.model.Caller;
import com.faceattend_edu.authorization_service.domain.model.UserRole;
import com.faceattend_edu.authorization_service.domain.port.in.AssignRoleToUserUseCase;
import com.faceattend_edu.authorization_service.domain.port.out.RoleRepository;
import com.faceattend_edu.authorization_service.domain.port.out.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssignRoleToUserUseCaseImpl implements AssignRoleToUserUseCase {

    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleAssignmentPolicy policy;

    @Override
    @Transactional
    public void assignRoleToUser(Caller caller, UUID userId, Integer roleId) {
        policy.requireMayChangeRole(caller, userId, roleId);
        if (!roleRepository.existsById(roleId)) throw new EntityNotFoundException("Role", roleId);
        if (userRoleRepository.exists(userId, roleId)) {
            throw new DuplicateEntityException("Role already assigned to user");
        }
        UserRole ur = new UserRole();
        ur.setUserId(userId);
        ur.setRoleId(roleId);
        ur.touchCreated();
        userRoleRepository.save(ur);
    }

    @Override
    @Transactional
    public void removeRoleFromUser(Caller caller, UUID userId, Integer roleId) {
        policy.requireMayChangeRole(caller, userId, roleId);
        if (!userRoleRepository.exists(userId, roleId)) {
            throw new EntityNotFoundException("UserRole", userId + "-" + roleId);
        }
        userRoleRepository.delete(userId, roleId);
    }
}
