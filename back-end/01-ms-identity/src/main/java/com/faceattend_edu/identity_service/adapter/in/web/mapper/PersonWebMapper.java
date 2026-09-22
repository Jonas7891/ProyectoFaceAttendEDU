package com.faceattend_edu.identity_service.adapter.in.web.mapper;

import com.faceattend_edu.identity_service.adapter.in.web.dto.PersonDto;
import com.faceattend_edu.identity_service.domain.model.Person;
import org.springframework.stereotype.Component;

@Component
public class PersonWebMapper {

    public PersonDto toDto(Person domain) {
        if (domain == null) return null;
        PersonDto dto = new PersonDto();
        dto.setPersonId(domain.getPersonId());
        dto.setName(domain.getName());
        dto.setLastName(domain.getLastName());
        dto.setEmail(domain.getEmail());
        return dto;
    }

    public Person toDomain(PersonDto dto) {
        if (dto == null) return null;
        Person person = new Person();
        person.setPersonId(dto.getPersonId());
        person.setName(dto.getName());
        person.setLastName(dto.getLastName());
        person.setEmail(dto.getEmail());
        return person;
    }
}
