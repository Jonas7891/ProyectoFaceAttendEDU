package com.faceattend_edu.audit.application.mapper;

import com.faceattend_edu.audit.domain.dto.patch.LogPatch;
import com.faceattend_edu.audit.domain.dto.request.LogRequest;
import com.faceattend_edu.audit.domain.dto.response.LogResponse;
import com.faceattend_edu.audit.domain.model.Log;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LogServiceMapper
        extends AbstractServiceMapper<Log, LogRequest, LogResponse, LogPatch> {

    @Override
    @Mapping(source = "userId", target = "user.id")
    Log toDomain(LogRequest logRequest);
}
