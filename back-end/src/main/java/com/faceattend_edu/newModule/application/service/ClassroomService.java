package com.faceattend_edu.newModule.application.service;

import com.faceattend_edu.newModule.domain.dto.patch.ClassroomPatch;
import com.faceattend_edu.newModule.domain.dto.request.ClassroomRequest;
import com.faceattend_edu.newModule.domain.dto.response.ClassroomResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface ClassroomService
        extends AbstractService<ClassroomRequest, ClassroomResponse, ClassroomPatch, Integer> {
}
