package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.port.in.GetClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetClassSessionUseCaseImpl implements GetClassSessionUseCase {
    private final ClassSessionRepository repository;
    private final SchedulingAccessPolicy access;

    @Override public ClassSession getById(Caller caller, Long id) {
        ClassSession found = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("ClassSession", id));
        access.requireSessionAccess(caller, found);
        return found;
    }
}
