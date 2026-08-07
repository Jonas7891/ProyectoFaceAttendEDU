package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.RolePatch;
import com.faceattend_edu.newModule.domain.dto.request.RoleRequest;
import com.faceattend_edu.newModule.domain.dto.response.RoleResponse;
import com.faceattend_edu.newModule.domain.model.Module;
import com.faceattend_edu.newModule.domain.model.Role;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import com.faceattend_edu.util.application.ReferenceMapperUtils;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleServiceMapper
        extends AbstractServiceMapper<Role, RoleRequest, RoleResponse, RolePatch> {

    @Override
    @Mapping(source = "moduleIds", target = "modules")
    Role toDomain(RoleRequest roleRequest);

    default List<Module> mapViewIds(List<Integer> moduleIds) {
        return ReferenceMapperUtils.toReferences(moduleIds, Module::new, Module::setId);
    }
}
