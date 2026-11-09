package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.model.ClassSessionFilter;
import com.faceattend_edu.scheduling_service.domain.port.in.ListClassSessionsUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import com.faceattend_edu.scheduling_service.domain.port.out.ScheduleBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ListClassSessionsUseCaseImpl implements ListClassSessionsUseCase {
    private final ClassSessionRepository repository;
    private final ScheduleBlockRepository blocks;
    private final SchedulingAccessPolicy access;

    @Override public List<ClassSession> list(Caller caller, ClassSessionFilter filter) {
        if (caller.seesNothing()) return List.of();
        ClassSessionFilter f = filter == null ? ClassSessionFilter.NONE : filter;
        if (f.sessionStatus() != null) {
            // Case-insensitive like before; a value that is no status matches nothing.
            String status = ClassSession.canonicalStatus(f.sessionStatus());
            if (status == null) return List.of();
            f = f.withSessionStatus(status);
        }
        return repository.search(f, caller.scopeSchoolId());
    }

    @Override public List<ClassSession> listByBlock(Caller caller, Long scheduleBlockId) {
        // A session's school is its block's school; scope by checking that one block.
        if (caller.restricted()) {
            access.requireBlockAccess(caller, blocks.findById(scheduleBlockId).orElse(null));
        }
        return repository.findByScheduleBlockId(scheduleBlockId);
    }
}
