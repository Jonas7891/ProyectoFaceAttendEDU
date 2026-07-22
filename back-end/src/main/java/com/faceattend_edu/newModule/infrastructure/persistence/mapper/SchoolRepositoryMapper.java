package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.School;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.SchoolEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SchoolRepositoryMapper {

    SchoolEntity toEntity(School school);

    School toDomain(SchoolEntity entity);
}
