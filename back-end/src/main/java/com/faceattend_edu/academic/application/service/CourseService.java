package com.faceattend_edu.academic.application.service;

import com.faceattend_edu.academic.domain.dto.patch.CoursePatch;
import com.faceattend_edu.academic.domain.dto.request.CourseRequest;
import com.faceattend_edu.academic.domain.dto.response.CourseResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface CourseService
        extends AbstractService<CourseRequest, CourseResponse, CoursePatch, Integer> {
}
