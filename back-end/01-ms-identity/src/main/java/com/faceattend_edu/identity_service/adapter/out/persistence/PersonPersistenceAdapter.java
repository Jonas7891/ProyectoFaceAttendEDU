package com.faceattend_edu.identity_service.adapter.out.persistence;

import com.faceattend_edu.identity_service.adapter.out.persistence.mapper.PersonPersistenceMapper;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.PersonJpaRepository;
import com.faceattend_edu.identity_service.application.port.out.LoadPersonPort;
import com.faceattend_edu.identity_service.application.port.out.ListPersonsPort;
import com.faceattend_edu.identity_service.application.port.out.SavePersonPort;
import com.faceattend_edu.identity_service.application.port.out.UpdatePersonPort;
import com.faceattend_edu.identity_service.domain.model.Person;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PersonPersistenceAdapter implements LoadPersonPort, SavePersonPort, UpdatePersonPort, ListPersonsPort {

    private final PersonJpaRepository repository;
    private final PersonPersistenceMapper mapper;

    @Override
    public Person loadPerson(UUID personId) {
        return mapper.toDomain(repository.findById(personId).orElse(null));
    }

    @Override
    public List<Person> listPersons() {
        return repository.findAll().stream().map(mapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public Person savePerson(Person person) {
        return mapper.toDomain(repository.save(mapper.toEntity(person)));
    }

    @Override
    public void updatePerson(Person person) {
        repository.save(mapper.toEntity(person));
    }
}
