package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.ViewRequest;
import com.faceattend_edu.domain.dto.response.ViewResponse;
import com.faceattend_edu.domain.model.View;
import com.faceattend_edu.infrastructure.persistence.entity.ViewEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ViewRepositoryMapper {

    @Mapping(source = "actions", target = "actions")
    ViewEntity toEntity(View view);

    @Mapping(source = "actions", target = "actions")
    View toDomain(ViewEntity entity);
}
