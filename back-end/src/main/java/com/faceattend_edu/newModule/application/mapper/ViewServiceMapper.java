package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.ViewPatch;
import com.faceattend_edu.newModule.domain.dto.request.ViewRequest;
import com.faceattend_edu.newModule.domain.dto.response.ViewResponse;
import com.faceattend_edu.newModule.domain.model.View;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ViewServiceMapper
        extends AbstractServiceMapper<View, ViewRequest, ViewResponse, ViewPatch> {
}
