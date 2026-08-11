package com.faceattend_edu.attendance.infrastructure.persistence.mapper;

import com.faceattend_edu.attendance.domain.model.Justification;
import com.faceattend_edu.attendance.infrastructure.persistence.entity.JustificationEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface JustificationRepositoryMapper extends AbstractRepositoryMapper<JustificationEntity, Justification> {
}
