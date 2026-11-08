package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import com.faceattend_edu.scheduling_service.domain.port.in.DeleteScheduleBlockUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ScheduleBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteScheduleBlockUseCaseImpl implements DeleteScheduleBlockUseCase {
    private final ScheduleBlockRepository repository;
    private final SchedulingAccessPolicy access;

    @Override
    public void delete(Caller caller, Long id) {
        ScheduleBlock found = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("ScheduleBlock", id));
        access.requireBlockAccess(caller, found);
        repository.deleteById(id);
    }
}
