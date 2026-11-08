package com.faceattend_edu.scheduling_service.domain.port.in;

import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.Environment;
import java.util.List;
public interface ListEnvironmentsUseCase {
    /**
     * A restricted caller always gets their own school, whatever {@code requestedSchoolId} says;
     * Super Administrador may filter by any school or none.
     */
    List<Environment> list(Caller caller, Integer requestedSchoolId);
}
