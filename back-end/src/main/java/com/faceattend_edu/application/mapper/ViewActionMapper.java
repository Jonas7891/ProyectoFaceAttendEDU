package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.ViewActionRequest;
import com.faceattend_edu.domain.dto.response.ViewActionResponse;
import com.faceattend_edu.domain.model.ViewAction;
import org.springframework.stereotype.Component;

@Component
public class ViewActionMapper {

    public ViewAction toDomain(ViewActionRequest request) {
        return new ViewAction(
                null,
                request.idView(),
                request.idAction()
        );
    }

    public ViewActionResponse toResponse(ViewAction viewAction) {
        return new ViewActionResponse(
                viewAction.getId(),
                viewAction.getIdView(),
                viewAction.getIdAction()
        );
    }
}
