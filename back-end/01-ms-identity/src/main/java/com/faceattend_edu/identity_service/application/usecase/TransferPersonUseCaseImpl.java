package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.TransferPersonUseCase;
import com.faceattend_edu.identity_service.application.port.out.LoadPersonPort;
import com.faceattend_edu.identity_service.application.port.out.LoadSchoolPort;
import com.faceattend_edu.identity_service.application.port.out.UpdatePersonPort;
import com.faceattend_edu.identity_service.domain.model.Person;
import com.faceattend_edu.identity_service.domain.model.School;
import com.faceattend_edu.identity_service.domain.service.PersonTransferService;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
public class TransferPersonUseCaseImpl implements TransferPersonUseCase {

    private final LoadPersonPort loadPersonPort;
    private final LoadSchoolPort loadSchoolPort;
    private final UpdatePersonPort updatePersonPort;
    private final PersonTransferService personTransferService;

    @Override
    public void transferPerson(UUID personId, UUID newSchoolId) {
        Person person = loadPersonPort.loadPerson(personId);
        School newSchool = loadSchoolPort.loadSchool(newSchoolId);
        
        personTransferService.transferPerson(person, newSchool);
        updatePersonPort.updatePerson(person);
    }
}
