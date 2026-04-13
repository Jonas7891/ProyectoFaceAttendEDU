package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.port.PersonRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.PersonEntity;
import com.faceattend_edu.infrastructure.persistence.entity.SchoolEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class PersonRepositoryAdapter implements PersonRepositoryPort {

    private final PersonJpaRepository jpaRepository;

    private final SchoolRepositoryAdapter schoolRepositoryAdapter;

    @Override
    public Person save(Person person) {
        PersonEntity entity = toEntity(person);
        PersonEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Person> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Person> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(this::toDomain)
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

    //

    private PersonEntity toEntity(Person person) {
        PersonEntity entity = new PersonEntity();
        entity.setId(person.getId());

        SchoolEntity school = new SchoolEntity();
        school.setId(person.getIdSchool().getId());
        entity.setIdSchool(school);

        entity.setName(person.getName());
        entity.setLastName(person.getLastName());
        entity.setEmail(person.getEmail());
        entity.setPhone(person.getPhone());
        entity.setIsStudent(person.getIsStudent());
        entity.setIsTeacher(person.getIsTeacher());
        entity.setStatus(person.getStatus());
        entity.setCreatedAt(person.getCreatedAt());
        entity.setUpdatedAt(person.getUpdatedAt());
        return entity;
    }

    public Person toDomain(PersonEntity entity) {
        return new Person(
                entity.getId(),
                schoolRepositoryAdapter.toDomain(entity.getIdSchool()),
                entity.getName(),
                entity.getLastName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getIsStudent(),
                entity.getIsTeacher(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
