package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.infrastructure.persistence.entity.PersonEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PersonRepositoryMapper {

    PersonEntity toEntity(Person person);

    Person toDomain(PersonEntity entity);
}
