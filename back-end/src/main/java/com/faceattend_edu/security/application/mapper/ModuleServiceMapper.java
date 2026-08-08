package com.faceattend_edu.security.application.mapper;

import com.faceattend_edu.security.domain.dto.patch.ModulePatch;
import com.faceattend_edu.security.domain.dto.request.ModuleRequest;
import com.faceattend_edu.security.domain.dto.response.ModuleResponse;
import com.faceattend_edu.security.domain.model.Module;
import com.faceattend_edu.security.domain.model.View;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import com.faceattend_edu.util.application.ReferenceMapperUtils;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ModuleServiceMapper
        extends AbstractServiceMapper<Module, ModuleRequest, ModuleResponse, ModulePatch> {

    @Override
    @Mapping(source = "viewIds", target = "views")
    Module toDomain(ModuleRequest moduleRequest);

    default List<View> mapViewIds(List<Integer> viewIds) {
        return ReferenceMapperUtils.toReferences(viewIds, View::new, View::setId);
    }
}
