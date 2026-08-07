package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.ActionRequest;
import com.faceattend_edu.domain.dto.response.ActionResponse;
import com.faceattend_edu.domain.model.Action;
import org.springframework.stereotype.Component;

@Component
public class ActionServiceMapper {

    public Action toDomain(ActionRequest request) {
        return new Action(
                null,
                request.name(),
                request.description(),
                request.httpMethod(),
                request.enabled()
        );
    }

    public ActionResponse toResponse(Action action) {
        return new ActionResponse(
                action.getId(),
                action.getName(),
                action.getDescription(),
                action.getHttpMethod(),
                action.getEnabled()
        );
    }
}
