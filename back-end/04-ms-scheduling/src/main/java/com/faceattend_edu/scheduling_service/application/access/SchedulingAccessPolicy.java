package com.faceattend_edu.scheduling_service.application.access;

import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.exception.NotClassInstructorException;
import com.faceattend_edu.scheduling_service.domain.exception.OutOfScopeException;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import com.faceattend_edu.scheduling_service.domain.port.out.EnvironmentRepository;
import com.faceattend_edu.scheduling_service.domain.port.out.ScheduleBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Who may see and change environments, schedule blocks and class sessions.
 *
 * <p>Only environment carries a school_id: a block traces its school through environment_id and a
 * session through schedule_block_id. A record of another school answers 404 ({@link OutOfScopeException});
 * a session of the caller's school that belongs to another instructor answers 403
 * ({@link NotClassInstructorException}). Unrestricted callers never pay for the lookups.</p>
 */
@Component
@RequiredArgsConstructor
public class SchedulingAccessPolicy {

    private final ScheduleBlockRepository blocks;
    private final EnvironmentRepository environments;

    public void requireSchool(Caller caller, Integer schoolId) {
        if (!caller.allowsSchool(schoolId)) throw new OutOfScopeException();
    }

    public void requireBlockAccess(Caller caller, ScheduleBlock block) {
        if (caller.restricted()) requireSchool(caller, schoolOf(block));
    }

    public void requireSessionAccess(Caller caller, ClassSession session) {
        if (caller.restricted()) requireSchool(caller, schoolOf(blockOf(session)));
    }

    /**
     * Any write on a class session is its instructor's job, or an administrator of the school's:
     * another instructor of the same school must not create, move, edit or delete someone else's class.
     */
    public void requireRunsClass(Caller caller, ClassSession session) {
        if (!caller.restricted() || caller.schoolAdmin()) return;
        requireIsClassInstructor(caller, session);
    }

    /**
     * Running a class (open, close, cancel) is strictly its instructor's act: no exemption for
     * Administrador or Super Administrador, who do not act on behalf of the instructor
     * (closed_by must be truthful).
     */
    public void requireIsClassInstructor(Caller caller, ClassSession session) {
        ScheduleBlock block = blockOf(session);
        Long own = caller.actorId();
        if (own == null || block == null || !own.equals(block.getInstructorActorId())) {
            throw new NotClassInstructorException();
        }
    }

    /** The block of a session; null when the session names none. A missing block is a 404. */
    private ScheduleBlock blockOf(ClassSession session) {
        if (session == null || session.getScheduleBlockId() == null) return null;
        return blocks.findById(session.getScheduleBlockId())
                .orElseThrow(() -> new EntityNotFoundException("ScheduleBlock", session.getScheduleBlockId()));
    }

    private Integer schoolOf(ScheduleBlock block) {
        if (block == null || block.getEnvironmentId() == null) return null;
        return environments.findById(block.getEnvironmentId())
                .orElseThrow(() -> new EntityNotFoundException("Environment", block.getEnvironmentId()))
                .getSchoolId();
    }
}
