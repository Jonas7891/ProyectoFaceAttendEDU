package com.faceattend_edu.audit.application.service;

import com.faceattend_edu.audit.domain.dto.patch.LogPatch;
import com.faceattend_edu.audit.domain.dto.request.LogRequest;
import com.faceattend_edu.audit.domain.dto.response.LogResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface LogService
        extends AbstractService<LogRequest, LogResponse, LogPatch, Long> {
}
