package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.GetPersonUseCase;
import com.faceattend_edu.identity_service.application.port.out.LoadPersonPort;
import com.faceattend_edu.identity_service.domain.model.Person;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
public class GetPersonUseCaseImpl implements GetPersonUseCase {

    private final LoadPersonPort loadPersonPort;

    @Override
    public Person getPerson(UUID personId) {
        return loadPersonPort.loadPerson(personId);
    }
}
