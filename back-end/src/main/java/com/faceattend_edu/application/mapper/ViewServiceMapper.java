package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.ViewRequest;
import com.faceattend_edu.domain.dto.response.ViewResponse;
import com.faceattend_edu.domain.model.View;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ViewServiceMapper {

    public View toDomain(ViewRequest request) {
        return new View(
                null,
                request.name(),
                request.route(),
                request.title(),
                request.isPublic(),
                List.of()
        );
    }

    public ViewResponse toResponse(View view) {
        return new ViewResponse(
                view.getId(),
                view.getName(),
                view.getRoute(),
                view.getTitle(),
                view.getIsPublic(),
                view.getActions()
        );
    }
}
