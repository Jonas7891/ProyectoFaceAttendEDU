package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.scheduling_service.domain.model.Environment;
import com.faceattend_edu.scheduling_service.domain.port.in.CreateEnvironmentUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.EnvironmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateEnvironmentUseCaseImpl implements CreateEnvironmentUseCase {

    private final EnvironmentRepository repository;

    @Override
    public Environment create(Environment environment) {
        environment.validate();
        environment.touchCreated();
        repository.findBySchoolIdAndCode(environment.getSchoolId(), environment.getCode()).ifPresent(e -> {
            throw new DuplicateEntityException("Environment already exists with schoolId=" + environment.getSchoolId() + " code=" + environment.getCode());
        });
        try {
            return repository.save(environment);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateEntityException("Environment duplicate violates unique constraint (school_id, code)", ex);
        }
    }
}
