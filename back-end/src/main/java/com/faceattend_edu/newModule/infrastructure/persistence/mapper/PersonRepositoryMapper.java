package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.Person;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.PersonEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PersonRepositoryMapper extends AbstractRepositoryMapper<PersonEntity, Person> {
}
