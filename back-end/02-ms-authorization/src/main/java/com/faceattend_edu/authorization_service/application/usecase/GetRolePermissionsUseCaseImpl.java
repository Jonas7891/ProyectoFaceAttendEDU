package com.faceattend_edu.authorization_service.application.usecase;

import com.faceattend_edu.authorization_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.authorization_service.domain.model.Permission;
import com.faceattend_edu.authorization_service.domain.port.in.GetRolePermissionsUseCase;
import com.faceattend_edu.authorization_service.domain.port.out.RolePermissionRepository;
import com.faceattend_edu.authorization_service.domain.port.out.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetRolePermissionsUseCaseImpl implements GetRolePermissionsUseCase {

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Override
    public List<Permission> permissionsOf(Integer roleId) {
        if (!roleRepository.existsById(roleId)) throw new EntityNotFoundException("Role", roleId);
        return rolePermissionRepository.findPermissionsByRoleId(roleId);
    }
}
