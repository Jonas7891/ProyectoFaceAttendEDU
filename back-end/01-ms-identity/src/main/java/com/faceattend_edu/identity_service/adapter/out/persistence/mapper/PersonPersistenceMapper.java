package com.faceattend_edu.identity_service.adapter.out.persistence.mapper;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.PersonJpaEntity;
import com.faceattend_edu.identity_service.domain.model.Person;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PersonPersistenceMapper {

    private final SchoolPersistenceMapper schoolPersistenceMapper;

    public Person toDomain(PersonJpaEntity entity) {
        if (entity == null) return null;
        return new Person(
            entity.getPersonId(),
            schoolPersistenceMapper.toDomain(entity.getSchool()),
            entity.getName(),
            entity.getLastName(),
            entity.getEmail(),
            entity.getPhone(),
            com.faceattend_edu.identity_service.domain.model.BloodType.valueOf(entity.getRh()),
            entity.getStatus(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    public PersonJpaEntity toEntity(Person domain) {
        if (domain == null) return null;
        return new PersonJpaEntity(
            domain.getPersonId(),
            schoolPersistenceMapper.toEntity(domain.getSchoolId()),
            domain.getName(),
            domain.getLastName(),
            domain.getEmail(),
            domain.getPhone(),
            domain.getRh().name(),
            domain.getStatus(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
}
