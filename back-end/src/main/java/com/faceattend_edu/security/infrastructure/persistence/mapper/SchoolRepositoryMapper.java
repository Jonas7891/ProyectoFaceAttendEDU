package com.faceattend_edu.security.infrastructure.persistence.mapper;

import com.faceattend_edu.security.domain.model.School;
import com.faceattend_edu.security.infrastructure.persistence.entity.SchoolEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SchoolRepositoryMapper extends AbstractRepositoryMapper<SchoolEntity, School> {
}
