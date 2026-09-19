package com.faceattend_edu.authorization_service.application.usecase;

import com.faceattend_edu.authorization_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.authorization_service.domain.model.Permission;
import com.faceattend_edu.authorization_service.domain.port.in.CreatePermissionUseCase;
import com.faceattend_edu.authorization_service.domain.port.out.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreatePermissionUseCaseImpl implements CreatePermissionUseCase {

    private final PermissionRepository permissionRepository;

    @Override
    public Permission createPermission(String permissionName, String description) {
        Permission p = new Permission();
        p.setPermissionName(permissionName);
        p.setDescription(description);
        p.validate();
        p.touchCreated();
        permissionRepository.findByPermissionName(permissionName).ifPresent(ex -> {
            throw new DuplicateEntityException("Permission already exists with name=" + permissionName);
        });
        return permissionRepository.save(p);
    }
}
