package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.port.in.UpdateClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UpdateClassSessionUseCaseImpl implements UpdateClassSessionUseCase {
    private final ClassSessionRepository repository;
    private final SchedulingAccessPolicy access;

    @Override public ClassSession update(Caller caller, Long id, ClassSession patch) {
        ClassSession existing = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("ClassSession", id));
        access.requireSessionAccess(caller, existing);
        access.requireRunsClass(caller, existing);
        // Moving the session to another block: the target block must be the caller's too.
        if (patch.getScheduleBlockId() != null) {
            access.requireSessionAccess(caller, patch);
            access.requireRunsClass(caller, patch);
        }
        existing.requireSameStatus(patch.getSessionStatus());
        if (patch.getScheduleBlockId() != null) existing.setScheduleBlockId(patch.getScheduleBlockId());
        if (patch.getSessionDate() != null) existing.setSessionDate(patch.getSessionDate());
        existing.validate();
        existing.touchUpdated();
        return repository.save(existing);
    }
}
