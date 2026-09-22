package com.faceattend_edu.identity_service.application.port.in;

import com.faceattend_edu.identity_service.domain.model.Person;

public interface UpdatePersonUseCase {
    void updatePerson(Person person);
}
