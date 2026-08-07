package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.port.PersonRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.PersonEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.PersonRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.PersonJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class PersonRepositoryAdapter implements PersonRepositoryPort {

    private final PersonJpaRepository jpaRepository;
    private final PersonRepositoryMapper mapper;

    @Override
    public Person save(Person person) {
        PersonEntity entity = mapper.toEntity(person);
        PersonEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Person> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Person> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public boolean existsByName(String name) {
        return jpaRepository.existsByName(name);
    }

}
