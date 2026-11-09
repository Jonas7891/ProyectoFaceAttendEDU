package com.faceattend_edu.scheduling_service.domain.port.in;

import com.faceattend_edu.scheduling_service.domain.model.Caller;

public interface DeleteScheduleBlockUseCase {
    void delete(Caller caller, Long id);
}
