package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.School;
import com.faceattend_edu.infrastructure.persistence.entity.SchoolEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SchoolRepositoryMapper {

    SchoolEntity toEntity(School school);

    School toDomain(SchoolEntity entity);
}
