package com.faceattend_edu.scheduling_service.domain.port.in;

import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
public interface OpenClassSessionUseCase {
    /** opened_by is the caller's own academic actor, never a client-supplied value. */
    ClassSession open(Caller caller, Long id);
}
