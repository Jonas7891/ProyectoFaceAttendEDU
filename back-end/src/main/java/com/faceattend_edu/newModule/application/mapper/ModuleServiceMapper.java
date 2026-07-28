package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.ModulePatch;
import com.faceattend_edu.newModule.domain.dto.request.ModuleRequest;
import com.faceattend_edu.newModule.domain.dto.response.ModuleResponse;
import com.faceattend_edu.newModule.domain.model.Module;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ModuleServiceMapper
        extends AbstractServiceMapper<Module, ModuleRequest, ModuleResponse, ModulePatch> {
}
