package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.UpdatePersonUseCase;
import com.faceattend_edu.identity_service.application.port.out.UpdatePersonPort;
import com.faceattend_edu.identity_service.domain.model.Person;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@RequiredArgsConstructor
public class UpdatePersonUseCaseImpl implements UpdatePersonUseCase {

    private final UpdatePersonPort updatePersonPort;

    @Override
    public void updatePerson(Person person) {
        person.validate();
        person.setUpdatedAt(LocalDateTime.now());
        updatePersonPort.updatePerson(person);
    }
}
