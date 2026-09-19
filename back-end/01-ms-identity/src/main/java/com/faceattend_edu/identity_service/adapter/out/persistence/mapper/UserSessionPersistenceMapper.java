package com.faceattend_edu.identity_service.adapter.out.persistence.mapper;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.UserSessionJpaEntity;
import com.faceattend_edu.identity_service.domain.model.UserSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserSessionPersistenceMapper {

    private final UserPersistenceMapper userPersistenceMapper;

    public UserSession toDomain(UserSessionJpaEntity entity) {
        if (entity == null) return null;
        return new UserSession(
            entity.getSessionId(),
            userPersistenceMapper.toDomain(entity.getUser()),
            entity.getStartDate(),
            entity.getEndDate(),
            entity.getSourceIp(),
            entity.getSessionStatus()
        );
    }

    public UserSessionJpaEntity toEntity(UserSession domain) {
        if (domain == null) return null;
        return new UserSessionJpaEntity(
            domain.getSessionId(),
            userPersistenceMapper.toEntity(domain.getUserId()),
            domain.getStartDate(),
            domain.getEndDate(),
            domain.getSourceIp(),
            domain.getSessionStatus()
        );
    }
}
