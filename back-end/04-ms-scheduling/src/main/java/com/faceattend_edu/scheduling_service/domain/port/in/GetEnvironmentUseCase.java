package com.faceattend_edu.scheduling_service.domain.port.in;

import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.Environment;
public interface GetEnvironmentUseCase {
    Environment getById(Caller caller, Integer id);
}
