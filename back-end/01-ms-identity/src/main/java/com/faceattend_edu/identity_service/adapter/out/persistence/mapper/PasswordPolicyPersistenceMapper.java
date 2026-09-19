package com.faceattend_edu.identity_service.adapter.out.persistence.mapper;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.PasswordPolicyJpaEntity;
import com.faceattend_edu.identity_service.domain.model.PasswordPolicy;
import org.springframework.stereotype.Component;

@Component
public class PasswordPolicyPersistenceMapper {

    public PasswordPolicy toDomain(PasswordPolicyJpaEntity entity) {
        if (entity == null) return null;
        return new PasswordPolicy(
            entity.getPolicyId(),
            entity.getMinLength(),
            entity.getMaxLength(),
            entity.getRequiresUppercase(),
            entity.getRequiresNumbers(),
            entity.getRequiresSymbols(),
            entity.getExpirationDays(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    public PasswordPolicyJpaEntity toEntity(PasswordPolicy domain) {
        if (domain == null) return null;
        return new PasswordPolicyJpaEntity(
            domain.getPolicyId(),
            domain.getMinLength(),
            domain.getMaxLength(),
            domain.getRequiresUppercase(),
            domain.getRequiresNumbers(),
            domain.getRequiresSymbols(),
            domain.getExpirationDays(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
}
