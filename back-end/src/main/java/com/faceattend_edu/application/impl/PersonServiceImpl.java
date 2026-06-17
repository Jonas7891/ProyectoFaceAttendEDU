package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.PersonServiceMapper;
import com.faceattend_edu.application.service.PersonService;
import com.faceattend_edu.domain.dto.request.PersonRequest;
import com.faceattend_edu.domain.dto.response.PersonResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.model.School;
import com.faceattend_edu.domain.port.PersonRepositoryPort;
import com.faceattend_edu.domain.port.SchoolRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class PersonServiceImpl implements PersonService {

    private final PersonRepositoryPort repository;
    private final PersonServiceMapper mapper;

    private final SchoolRepositoryPort schoolRepositoryPort;

    @Override
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public PersonResponse save(PersonRequest request) {
        School school = schoolRepositoryPort.findById(request.schoolId())
                .orElseThrow(() -> new NotFoundException("School", request.schoolId()));

        Person person = mapper.toDomain(request, school);
        Person saved = repository.save(person);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PersonResponse update(Integer id, PersonRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Person", id));
        School school = schoolRepositoryPort.findById(request.schoolId())
                .orElseThrow(() -> new NotFoundException("School", request.schoolId()));

        Person updated = mapper.toDomain(request, school);
        updated.setId(id);
        Person saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Person", id);
        }
        repository.deleteById(id);
    }
}
