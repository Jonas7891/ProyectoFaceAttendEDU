package com.faceattend_edu.security.infrastructure.persistence.mapper;

import com.faceattend_edu.security.domain.model.Person;
import com.faceattend_edu.security.infrastructure.persistence.entity.PersonEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PersonRepositoryMapper extends AbstractRepositoryMapper<PersonEntity, Person> {
}
