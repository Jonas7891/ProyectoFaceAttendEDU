package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.ViewRequest;
import com.faceattend_edu.domain.dto.response.ViewResponse;
import com.faceattend_edu.domain.model.Action;
import com.faceattend_edu.domain.model.View;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class ViewServiceMapper {

    private final ActionServiceMapper actionServiceMapper;

    public View toDomain(ViewRequest request,
                         List<Action> actions) {
        return new View(
                null,
                request.name(),
                request.route(),
                request.title(),
                request.isPublic(),
                actions
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
                        .stream()
                        .map(actionServiceMapper::toResponse)
                        .toList()
        );
    }
}
