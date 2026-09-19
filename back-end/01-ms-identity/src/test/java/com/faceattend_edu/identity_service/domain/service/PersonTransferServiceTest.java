package com.faceattend_edu.identity_service.domain.service;

import com.faceattend_edu.identity_service.domain.model.Person;
import com.faceattend_edu.identity_service.domain.model.School;
import com.faceattend_edu.identity_service.domain.exception.DomainException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;

class PersonTransferServiceTest {

    @Test
    void shouldTransferPersonWhenSchoolIsActive() {
        Person person = new Person();
        
        School school = new School();
        school.setSchoolId(UUID.randomUUID());
        school.setStatus(true);
        
        PersonTransferService service = new PersonTransferService();
        service.transferPerson(person, school);
        
        assertEquals(school, person.getSchoolId());
    }

    @Test
    void shouldThrowExceptionWhenSchoolIsInactive() {
        Person person = new Person();
        
        School school = new School();
        school.setSchoolId(UUID.randomUUID());
        school.setStatus(false);
        
        PersonTransferService service = new PersonTransferService();
        assertThrows(DomainException.class, () -> service.transferPerson(person, school));
    }
}
