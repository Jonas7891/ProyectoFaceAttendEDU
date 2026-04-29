package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.ModuleRequest;
import com.faceattend_edu.domain.dto.response.ModuleResponse;
import com.faceattend_edu.domain.model.Module;
import com.faceattend_edu.infrastructure.persistence.entity.ModuleEntity;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ModuleRepositoryMapper {

    ModuleEntity toEntity(Module module);

    Module toDomain(ModuleEntity entity);
}
