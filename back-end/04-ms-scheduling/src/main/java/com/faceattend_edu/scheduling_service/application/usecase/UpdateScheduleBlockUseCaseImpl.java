package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import com.faceattend_edu.scheduling_service.domain.port.in.UpdateScheduleBlockUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ScheduleBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UpdateScheduleBlockUseCaseImpl implements UpdateScheduleBlockUseCase {
    private final ScheduleBlockRepository repository;
    private final ScheduleBlockOverlapGuard overlapGuard;
    private final SchedulingAccessPolicy access;

    @Override
    public ScheduleBlock update(Caller caller, Long id, ScheduleBlock patch) {
        ScheduleBlock existing = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("ScheduleBlock", id));
        access.requireBlockAccess(caller, existing);
        // Moving the block to another environment must stay inside the caller's school.
        if (patch.getEnvironmentId() != null) access.requireBlockAccess(caller, patch);
        if (patch.getCohortId() != null) existing.setCohortId(patch.getCohortId());
        if (patch.getCourseId() != null) existing.setCourseId(patch.getCourseId());
        if (patch.getEnvironmentId() != null) existing.setEnvironmentId(patch.getEnvironmentId());
        if (patch.getInstructorActorId() != null) existing.setInstructorActorId(patch.getInstructorActorId());
        if (patch.getDayOfWeek() != null) existing.setDayOfWeek(patch.getDayOfWeek());
        if (patch.getStartsAt() != null) existing.setStartsAt(patch.getStartsAt());
        if (patch.getEndsAt() != null) existing.setEndsAt(patch.getEndsAt());
        existing.validate();
        overlapGuard.check(existing, id);
        existing.touchUpdated();
        try {
            return repository.save(existing);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateEntityException("ScheduleBlock double-booking violates unique constraint", ex);
        }
    }
}
