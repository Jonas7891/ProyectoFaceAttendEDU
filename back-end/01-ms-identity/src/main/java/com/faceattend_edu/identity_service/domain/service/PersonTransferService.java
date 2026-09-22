package com.faceattend_edu.identity_service.domain.service;

import com.faceattend_edu.identity_service.domain.model.Person;
import com.faceattend_edu.identity_service.domain.model.School;
import com.faceattend_edu.identity_service.domain.exception.DomainException;
import org.springframework.stereotype.Service;

@Service
public class PersonTransferService {

    public void transferPerson(Person person, School newSchool) {
        if (newSchool == null) {
            throw new DomainException("Cannot transfer person to a null school");
        }
        
        if (!newSchool.isActive()) {
            throw new DomainException("Cannot transfer person: destination school is inactive");
        }
        
        person.setSchoolId(newSchool);
    }
}
