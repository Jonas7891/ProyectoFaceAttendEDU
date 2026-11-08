package com.faceattend_edu.scheduling_service.domain.port.in;

import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
public interface UpdateClassSessionUseCase {
    ClassSession update(Caller caller, Long id, ClassSession patch);
}
