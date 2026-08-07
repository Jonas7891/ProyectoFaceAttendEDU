package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.ActionPatch;
import com.faceattend_edu.newModule.domain.dto.request.ActionRequest;
import com.faceattend_edu.newModule.domain.dto.response.ActionResponse;
import com.faceattend_edu.newModule.domain.model.Action;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ActionServiceMapper
        extends AbstractServiceMapper<Action, ActionRequest, ActionResponse, ActionPatch> {
}
