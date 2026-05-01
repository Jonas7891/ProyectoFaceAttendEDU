package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.ModuleRequest;
import com.faceattend_edu.domain.dto.response.ModuleResponse;
import com.faceattend_edu.domain.model.Module;
import com.faceattend_edu.domain.model.View;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class ModuleServiceMapper {

    private final ViewServiceMapper viewServiceMapper;

    public Module toDomain(ModuleRequest request,
                           List<View> views) {
        return new Module(
                null,
                request.name(),
                request.description(),
                request.icon(),
                request.order(),
                views
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
                        .stream()
                        .map(viewServiceMapper::toResponse)
                        .toList()
        );
    }
}
