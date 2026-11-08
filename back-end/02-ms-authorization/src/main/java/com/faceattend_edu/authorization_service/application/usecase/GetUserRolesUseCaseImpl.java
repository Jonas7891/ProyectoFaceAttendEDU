package com.faceattend_edu.authorization_service.application.usecase;

import com.faceattend_edu.authorization_service.domain.exception.ValidationException;
import com.faceattend_edu.authorization_service.domain.model.Role;
import com.faceattend_edu.authorization_service.domain.port.in.GetUserRolesUseCase;
import com.faceattend_edu.authorization_service.domain.port.out.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetUserRolesUseCaseImpl implements GetUserRolesUseCase {

    private final UserRoleRepository userRoleRepository;

    @Override
    public List<Role> rolesOf(UUID userId) {
        return userRoleRepository.findRolesByUserId(userId);
    }

    @Override
    public Map<UUID, List<Role>> rolesOf(Collection<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) return Map.of();
        if (userIds.size() > MAX_BATCH_USERS) {
            throw new ValidationException("userIds accepts at most " + MAX_BATCH_USERS + " ids per request");
        }
        return userRoleRepository.findRolesByUserIds(userIds);
    }
}
