package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.Environment;
import com.faceattend_edu.scheduling_service.domain.port.in.ListEnvironmentsUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.EnvironmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ListEnvironmentsUseCaseImpl implements ListEnvironmentsUseCase {
    private final EnvironmentRepository repository;

    @Override
    public List<Environment> list(Caller caller, Integer requestedSchoolId) {
        // Restricted callers always get their own school, never the whole table (fail closed without one).
        if (caller.restricted()) return caller.schoolId() == null ? List.of() : repository.findBySchoolId(caller.schoolId());
        return requestedSchoolId != null ? repository.findBySchoolId(requestedSchoolId) : repository.findAll();
    }
}
