package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.LogPatch;
import com.faceattend_edu.newModule.domain.dto.request.LogRequest;
import com.faceattend_edu.newModule.domain.dto.response.LogResponse;
import com.faceattend_edu.newModule.domain.model.Log;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LogServiceMapper
        extends AbstractServiceMapper<Log, LogRequest, LogResponse, LogPatch> {
}
