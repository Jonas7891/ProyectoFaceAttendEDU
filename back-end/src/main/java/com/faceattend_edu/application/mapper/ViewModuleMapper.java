package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.ViewModuleRequest;
import com.faceattend_edu.domain.dto.response.ViewModuleResponse;
import com.faceattend_edu.domain.model.ViewModule;
import org.springframework.stereotype.Component;

@Component
public class ViewModuleMapper {

    public ViewModule toDomain(ViewModuleRequest request) {
        return new ViewModule(
                null,
                request.idView(),
                request.idModule()
        );
    }

    public ViewModuleResponse toResponse(ViewModule viewModule) {
        return new ViewModuleResponse(
                viewModule.getId(),
                viewModule.getIdView(),
                viewModule.getIdModule()
        );
    }
}
