package com.faceattend_edu.academic.application.service;

import com.faceattend_edu.academic.domain.dto.patch.ClassroomPatch;
import com.faceattend_edu.academic.domain.dto.request.ClassroomRequest;
import com.faceattend_edu.academic.domain.dto.response.ClassroomResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface ClassroomService
        extends AbstractService<ClassroomRequest, ClassroomResponse, ClassroomPatch, Integer> {
}
