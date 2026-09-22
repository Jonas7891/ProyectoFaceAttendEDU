package com.faceattend_edu.identity_service.adapter.out.persistence.mapper;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.UserJpaEntity;
import com.faceattend_edu.identity_service.domain.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserPersistenceMapper {

    public User toDomain(UserJpaEntity entity) {
        if (entity == null) return null;
        return new User(
            entity.getUserId(),
            null, // Person needs separate mapping to avoid circular dependency
            entity.getUsername(),
            entity.getPasswordHash(),
            entity.getAuthenticationType(),
            entity.getStatus(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            entity.getLastAccess()
        );
    }

    public UserJpaEntity toEntity(User domain) {
        if (domain == null) return null;
        return new UserJpaEntity(
            domain.getUserId(),
            null, // Person needs separate mapping
            domain.getUsername(),
            domain.getPasswordHash(),
            domain.getAuthenticationType(),
            domain.getStatus(),
            domain.getCreatedAt(),
            domain.getUpdatedAt(),
            domain.getLastAccess()
        );
    }
}
