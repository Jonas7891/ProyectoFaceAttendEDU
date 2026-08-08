package com.faceattend_edu.security.application.mapper;

import com.faceattend_edu.security.domain.dto.patch.PersonPatch;
import com.faceattend_edu.security.domain.dto.request.PersonRequest;
import com.faceattend_edu.security.domain.dto.response.PersonResponse;
import com.faceattend_edu.security.domain.model.Person;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PersonServiceMapper
        extends AbstractServiceMapper<Person, PersonRequest, PersonResponse, PersonPatch> {

    @Override
    @Mapping(source = "schoolId", target = "school.id")
    Person toDomain(PersonRequest personRequest);
}
