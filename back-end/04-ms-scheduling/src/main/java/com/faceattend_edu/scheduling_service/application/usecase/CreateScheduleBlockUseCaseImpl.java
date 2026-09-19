package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import com.faceattend_edu.scheduling_service.domain.port.in.CreateScheduleBlockUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ScheduleBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateScheduleBlockUseCaseImpl implements CreateScheduleBlockUseCase {

    private final ScheduleBlockRepository repository;

    @Override
    public ScheduleBlock create(ScheduleBlock block) {
        block.validate();
        block.touchCreated();
        try {
            return repository.save(block);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateEntityException("ScheduleBlock double-booking violates unique constraint (environment or instructor slot)", ex);
        }
    }
}
