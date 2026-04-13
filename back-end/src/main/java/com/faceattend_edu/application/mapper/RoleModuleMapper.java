package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.RoleModuleRequest;
import com.faceattend_edu.domain.dto.response.RoleModuleResponse;
import com.faceattend_edu.domain.model.RoleModule;
import org.springframework.stereotype.Component;

@Component
public class RoleModuleMapper {

    public RoleModule toDomain(RoleModuleRequest request) {
        return new RoleModule(
                null,
                request.idRole(),
                request.idModule()
        );
    }

    public RoleModuleResponse toResponse(RoleModule roleModule) {
        return new RoleModuleResponse(
                roleModule.getId(),
                roleModule.getIdRole(),
                roleModule.getIdModule()
        );
    }
}
