package com.faceattend_edu.newModule.application.service;

import com.faceattend_edu.newModule.domain.dto.patch.CoursePatch;
import com.faceattend_edu.newModule.domain.dto.request.CourseRequest;
import com.faceattend_edu.newModule.domain.dto.response.CourseResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface CourseService
        extends AbstractService<CourseRequest, CourseResponse, CoursePatch, Integer> {
}
