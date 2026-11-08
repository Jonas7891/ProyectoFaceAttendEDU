package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.Environment;
import com.faceattend_edu.scheduling_service.domain.port.in.UpdateEnvironmentUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.EnvironmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UpdateEnvironmentUseCaseImpl implements UpdateEnvironmentUseCase {
    private final EnvironmentRepository repository;
    private final SchedulingAccessPolicy access;

    @Override
    public Environment update(Caller caller, Integer id, Environment patch) {
        Environment existing = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Environment", id));
        access.requireSchool(caller, existing.getSchoolId());
        // Moving an environment to another school is only possible into a school the caller manages.
        if (patch.getSchoolId() != null) access.requireSchool(caller, patch.getSchoolId());
        if (patch.getSchoolId() != null) existing.setSchoolId(patch.getSchoolId());
        if (patch.getCode() != null) existing.setCode(patch.getCode());
        if (patch.getName() != null) existing.setName(patch.getName());
        if (patch.getCapacity() != null) existing.setCapacity(patch.getCapacity());
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());
        existing.validate();
        existing.touchUpdated();
        return repository.save(existing);
    }
}
