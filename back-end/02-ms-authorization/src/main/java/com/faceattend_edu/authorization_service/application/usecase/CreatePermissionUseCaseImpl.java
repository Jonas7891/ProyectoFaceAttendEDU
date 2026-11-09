package com.faceattend_edu.authorization_service.application.usecase;

import com.faceattend_edu.authorization_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.authorization_service.domain.model.Permission;
import com.faceattend_edu.authorization_service.domain.port.in.CreatePermissionUseCase;
import com.faceattend_edu.authorization_service.domain.port.out.PermissionRepository;
import com.faceattend_edu.authorization_service.domain.port.out.EventPublisherPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreatePermissionUseCaseImpl implements CreatePermissionUseCase {

    private final PermissionRepository permissionRepository;
    private final EventPublisherPort eventPublisher;

    @Override
    @Transactional
    public Permission createPermission(String permissionName, String description) {
        Permission p = new Permission();
        p.setPermissionName(permissionName);
        p.setDescription(description);
        p.validate();
        p.touchCreated();
        permissionRepository.findByPermissionName(permissionName).ifPresent(ex -> {
            throw new DuplicateEntityException("Permission already exists with name=" + permissionName);
        });
        Permission saved = permissionRepository.save(p);
        eventPublisher.publish("permission-events", "{\"permissionId\":" + saved.getPermissionId() + ",\"permissionName\":\"" + saved.getPermissionName() + "\"}");
        return saved;
    }
}
