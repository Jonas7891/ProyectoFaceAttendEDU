package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.JustificationRequest;
import com.faceattend_edu.domain.dto.response.JustificationResponse;
import com.faceattend_edu.domain.model.Justification;
import com.faceattend_edu.infrastructure.persistence.entity.AttendanceEntity;
import com.faceattend_edu.infrastructure.persistence.entity.JustificationEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface JustificationRepositoryMapper {

    JustificationEntity toEntity(Justification justification);

    Justification toDomain(JustificationEntity entity);
}
