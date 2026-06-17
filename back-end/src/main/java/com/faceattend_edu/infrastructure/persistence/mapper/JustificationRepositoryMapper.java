package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.Justification;
import com.faceattend_edu.infrastructure.persistence.entity.JustificationEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface JustificationRepositoryMapper {

    JustificationEntity toEntity(Justification justification);

    Justification toDomain(JustificationEntity entity);
}
