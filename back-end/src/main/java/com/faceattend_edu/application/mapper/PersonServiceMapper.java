package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.PersonRequest;
import com.faceattend_edu.domain.dto.response.PersonResponse;
import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.model.School;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class PersonServiceMapper {

    private final SchoolServiceMapper schoolServiceMapper;

    public Person toDomain(PersonRequest request,
                           School school) {
        return new Person(
                null,
                school,
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
                schoolServiceMapper.toResponse(person.getSchool()),
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
