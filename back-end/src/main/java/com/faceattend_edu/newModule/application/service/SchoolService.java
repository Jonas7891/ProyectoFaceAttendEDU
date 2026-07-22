package com.faceattend_edu.newModule.application.service;

import com.faceattend_edu.newModule.domain.dto.patch.SchoolPatch;
import com.faceattend_edu.newModule.domain.dto.request.SchoolRequest;
import com.faceattend_edu.newModule.domain.dto.response.SchoolResponse;
import com.faceattend_edu.util.application.AbstractService;

import java.util.UUID;

public interface SchoolService extends AbstractService<SchoolRequest, SchoolResponse, SchoolPatch, UUID> {
}
