package com.faceattend_edu.authorization_service.application.usecase;

import com.faceattend_edu.authorization_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.authorization_service.domain.model.Role;
import com.faceattend_edu.authorization_service.domain.port.in.CreateRoleUseCase;
import com.faceattend_edu.authorization_service.domain.port.out.RoleRepository;
import com.faceattend_edu.authorization_service.domain.port.out.EventPublisherPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateRoleUseCaseImpl implements CreateRoleUseCase {

    private final RoleRepository roleRepository;
    private final EventPublisherPort eventPublisher;

    @Override
    @Transactional
    public Role createRole(String roleName, String description) {
        Role role = new Role();
        role.setRoleName(roleName);
        role.setDescription(description);
        role.validate();
        role.touchCreated();
        roleRepository.findByRoleName(roleName).ifPresent(r -> {
            throw new DuplicateEntityException("Role already exists with name=" + roleName);
        });
        Role saved = roleRepository.save(role);
        eventPublisher.publish("role-events", "{\"roleId\":" + saved.getRoleId() + ",\"roleName\":\"" + saved.getRoleName() + "\"}");
        return saved;
    }
}
