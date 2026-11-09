package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlockFilter;
import com.faceattend_edu.scheduling_service.domain.port.in.ListScheduleBlocksUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ScheduleBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ListScheduleBlocksUseCaseImpl implements ListScheduleBlocksUseCase {
    private final ScheduleBlockRepository repository;

    @Override
    public List<ScheduleBlock> list(Caller caller, ScheduleBlockFilter filter) {
        if (caller.seesNothing()) return List.of();
        return repository.search(filter == null ? ScheduleBlockFilter.NONE : filter, caller.scopeSchoolId());
    }
}
