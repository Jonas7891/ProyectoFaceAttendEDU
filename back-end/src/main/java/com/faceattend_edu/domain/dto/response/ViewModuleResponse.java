package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Module;
import com.faceattend_edu.domain.model.View;

public record ViewModuleResponse(
        Integer id,
        View idView,
        Module idModule
) {
}