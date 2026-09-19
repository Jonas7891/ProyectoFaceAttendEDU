package com.faceattend_edu.identity_service.adapter.out.persistence.mapper;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.CityJpaEntity;
import com.faceattend_edu.identity_service.domain.model.City;
import org.springframework.stereotype.Component;

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
        return new CityJpaEntity(
            domain.getCityId(),
            domain.getName(),
            domain.getDepartment(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
}
