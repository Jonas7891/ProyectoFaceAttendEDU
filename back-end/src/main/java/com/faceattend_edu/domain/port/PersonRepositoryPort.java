package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Person;

import java.util.List;
import java.util.Optional;

public interface PersonRepositoryPort {
    Person save(Person person);

    Optional<Person> findById(Integer id);

    List<Person> findAll();

    void deleteById(Integer id);

    boolean existsByName(String name);
}
