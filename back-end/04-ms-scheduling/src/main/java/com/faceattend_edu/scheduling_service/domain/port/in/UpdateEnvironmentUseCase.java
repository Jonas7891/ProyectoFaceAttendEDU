package com.faceattend_edu.scheduling_service.domain.port.in;

import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.Environment;
public interface UpdateEnvironmentUseCase {
    Environment update(Caller caller, Integer id, Environment patch);
}
