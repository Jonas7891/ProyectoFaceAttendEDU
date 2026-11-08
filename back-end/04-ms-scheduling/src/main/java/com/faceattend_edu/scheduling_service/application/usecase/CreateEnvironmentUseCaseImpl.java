package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.Environment;
import com.faceattend_edu.scheduling_service.domain.port.in.CreateEnvironmentUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.EnvironmentRepository;
import com.faceattend_edu.scheduling_service.infrastructure.messaging.DomainEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateEnvironmentUseCaseImpl implements CreateEnvironmentUseCase {
    private final EnvironmentRepository repository;
    private final DomainEventPublisher eventPublisher;
    private final SchedulingAccessPolicy access;

    @Override
    public Environment create(Caller caller, Environment environment) {
        access.requireSchool(caller, environment.getSchoolId());
        environment.validate();
        environment.touchCreated();
        repository.findBySchoolIdAndCode(environment.getSchoolId(), environment.getCode()).ifPresent(e -> {
            throw new DuplicateEntityException("Environment already exists with schoolId=" + environment.getSchoolId() + " code=" + environment.getCode());
        });
        try {
            Environment saved = repository.save(environment);
            eventPublisher.publish("environment-events", "{\"environmentId\":" + saved.getEnvironmentId() + ",\"code\":\"" + saved.getCode() + "\"}");
            return saved;
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateEntityException("Environment duplicate violates unique constraint (school_id, code)", ex);
        }
    }
}
