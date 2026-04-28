package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.ModuleRequest;
import com.faceattend_edu.domain.dto.response.ModuleResponse;
import com.faceattend_edu.domain.model.Module;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ModuleServiceMapper {

    public Module toDomain(ModuleRequest request) {
        return new Module(
                null,
                request.name(),
                request.description(),
                request.icon(),
                request.order(),
                List.of()
        );
    }

    public ModuleResponse toResponse(Module module) {
        return new ModuleResponse(
                module.getId(),
                module.getName(),
                module.getDescription(),
                module.getIcon(),
                module.getOrder(),
                module.getViews()
        );
    }
}
