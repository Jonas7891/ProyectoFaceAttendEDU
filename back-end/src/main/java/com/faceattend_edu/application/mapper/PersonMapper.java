package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.PersonRequest;
import com.faceattend_edu.domain.dto.response.PersonResponse;
import com.faceattend_edu.domain.model.Person;
import org.springframework.stereotype.Component;

@Component
public class PersonMapper {

    public Person toDomain(PersonRequest request) {
        return new Person(
                null,
                request.idSchool(),
                request.name(),
                request.lastName(),
                request.email(),
                request.phone(),
                request.isStudent(),
                request.isTeacher(),
                request.status(),
                request.createdAt(),
                request.updatedAt()
        );
    }

    public PersonResponse toResponse(Person person) {
        return new PersonResponse(
                person.getId(),
                person.getIdSchool(),
                person.getName(),
                person.getLastName(),
                person.getEmail(),
                person.getPhone(),
                person.getIsStudent(),
                person.getIsTeacher(),
                person.getStatus(),
                person.getCreatedAt(),
                person.getUpdatedAt()
        );
    }
}
