package com.faceattend_edu.security.application.mapper;

import com.faceattend_edu.security.domain.dto.patch.ActionPatch;
import com.faceattend_edu.security.domain.dto.request.ActionRequest;
import com.faceattend_edu.security.domain.dto.response.ActionResponse;
import com.faceattend_edu.security.domain.model.Action;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ActionServiceMapper
        extends AbstractServiceMapper<Action, ActionRequest, ActionResponse, ActionPatch> {
}
