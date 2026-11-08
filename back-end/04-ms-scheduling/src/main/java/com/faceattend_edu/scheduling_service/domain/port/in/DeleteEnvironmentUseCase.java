package com.faceattend_edu.scheduling_service.domain.port.in;

import com.faceattend_edu.scheduling_service.domain.model.Caller;

public interface DeleteEnvironmentUseCase {
    void delete(Caller caller, Integer id);
}
