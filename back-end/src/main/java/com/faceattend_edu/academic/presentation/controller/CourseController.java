package com.faceattend_edu.academic.presentation.controller;

import com.faceattend_edu.academic.application.service.CourseService;
import com.faceattend_edu.academic.domain.dto.patch.CoursePatch;
import com.faceattend_edu.academic.domain.dto.request.CourseRequest;
import com.faceattend_edu.academic.domain.dto.response.CourseResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/courses")
public class CourseController extends AbstractController<CourseResponse, CourseRequest, CoursePatch, Integer> {

    private final CourseService service;

    @Override
    protected AbstractService<CourseRequest, CourseResponse, CoursePatch, Integer> getService() {
        return service;
    }
}
