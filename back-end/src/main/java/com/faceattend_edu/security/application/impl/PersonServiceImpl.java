package com.faceattend_edu.security.application.impl;

import com.faceattend_edu.security.application.mapper.PersonServiceMapper;
import com.faceattend_edu.security.application.service.PersonService;
import com.faceattend_edu.security.domain.dto.patch.PersonPatch;
import com.faceattend_edu.security.domain.dto.request.PersonRequest;
import com.faceattend_edu.security.domain.dto.response.PersonResponse;
import com.faceattend_edu.security.domain.model.Person;
import com.faceattend_edu.security.domain.port.PersonRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class PersonServiceImpl
        extends AbstractServiceImpl<Person, PersonResponse, PersonRequest, PersonPatch, UUID>
        implements PersonService {

    private final PersonRepositoryPort repository;
    private final PersonServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<Person, UUID> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "Person";
    }

    @Override
    protected Function<PersonRequest, Person> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<Person, PersonResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<Person, PersonRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<Person, PersonPatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<Person, Boolean> setStatus() {
        return Person::setStatus;
    }
}
