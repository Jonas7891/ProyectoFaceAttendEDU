package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Action;
import com.faceattend_edu.domain.model.View;

public record ViewActionResponse(
        Integer id,
        View idView,
        Action idAction
) {
}