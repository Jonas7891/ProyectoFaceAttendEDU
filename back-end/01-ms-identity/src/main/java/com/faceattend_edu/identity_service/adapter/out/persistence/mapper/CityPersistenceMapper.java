package com.faceattend_edu.identity_service.adapter.out.persistence.mapper;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.CityJpaEntity;
import com.faceattend_edu.identity_service.domain.model.City;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class CityPersistenceMapper {

    public City toDomain(CityJpaEntity entity) {
        if (entity == null) return null;
        return new City(
            entity.getCityId(),
            entity.getName(),
            entity.getDepartment(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    public CityJpaEntity toEntity(City domain) {
        if (domain == null) return null;
        CityJpaEntity entity = new CityJpaEntity();
        entity.setCityId(domain.getCityId());
        entity.setName(domain.getName());
        entity.setDepartment(domain.getDepartment());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        // created_at es NOT NULL sin default en el DDL canonico.
        if (entity.getCreatedAt() == null) entity.setCreatedAt(LocalDateTime.now());
        return entity;
    }
}
