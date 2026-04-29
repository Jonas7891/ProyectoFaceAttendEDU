package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.PersonServiceMapper;
import com.faceattend_edu.application.service.PersonService;
import com.faceattend_edu.domain.dto.request.PersonRequest;
import com.faceattend_edu.domain.dto.response.PersonResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.port.PersonRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class PersonServiceImpl implements PersonService {

    private final PersonRepositoryPort repository;
    private final PersonServiceMapper mapper;

    @Override
    public PersonResponse findById(Integer id) {
        Person person = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Person", id));
        return mapper.toResponse(person);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public PersonResponse save(PersonRequest request) {
        Person person = mapper.toDomain(request);
        Person saved = repository.save(person);
        return mapper.toResponse(saved);
    }

    @Override
    public PersonResponse update(Integer id, PersonRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Person", id));
        Person updated = mapper.toDomain(request);
        updated.setId(id);
        Person saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Person", id);
        }
        repository.deleteById(id);
    }
}
