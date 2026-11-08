package com.faceattend_edu.scheduling_service.domain.port.in;

import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
public interface CloseClassSessionUseCase {
    /** closed_by is the caller's own academic actor, never a client-supplied value. */
    ClassSession close(Caller caller, Long id);
}
