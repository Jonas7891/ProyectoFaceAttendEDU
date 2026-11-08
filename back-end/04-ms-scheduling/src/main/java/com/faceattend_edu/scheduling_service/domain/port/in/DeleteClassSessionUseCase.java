package com.faceattend_edu.scheduling_service.domain.port.in;

import com.faceattend_edu.scheduling_service.domain.model.Caller;

public interface DeleteClassSessionUseCase {
    void delete(Caller caller, Long id);
}
