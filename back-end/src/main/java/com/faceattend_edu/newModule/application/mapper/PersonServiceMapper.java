package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.PersonPatch;
import com.faceattend_edu.newModule.domain.dto.request.PersonRequest;
import com.faceattend_edu.newModule.domain.dto.response.PersonResponse;
import com.faceattend_edu.newModule.domain.model.Person;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PersonServiceMapper
        extends AbstractServiceMapper<Person, PersonRequest, PersonResponse, PersonPatch> {
}
