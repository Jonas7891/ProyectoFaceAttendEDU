package com.faceattend_edu.security.infrastructure.persistence.adapter;

import com.faceattend_edu.security.domain.model.Person;
import com.faceattend_edu.security.domain.port.PersonRepositoryPort;
import com.faceattend_edu.security.infrastructure.persistence.entity.PersonEntity;
import com.faceattend_edu.security.infrastructure.persistence.mapper.PersonRepositoryMapper;
import com.faceattend_edu.security.infrastructure.persistence.repository.PersonJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.function.Function;

@Component
@AllArgsConstructor
public class PersonRepositoryAdapter
        extends AbstractRepositoryAdapter<PersonEntity, Person, UUID>
        implements PersonRepositoryPort {

    private final PersonJpaRepository jpaRepository;
    private final PersonRepositoryMapper mapper;

    @Override
    protected JpaRepository<PersonEntity, UUID> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<Person, PersonEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<PersonEntity, Person> toDomainMapper() {
        return mapper::toDomain;
    }
}
