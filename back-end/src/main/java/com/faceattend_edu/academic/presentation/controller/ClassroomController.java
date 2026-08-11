package com.faceattend_edu.academic.presentation.controller;

import com.faceattend_edu.academic.application.service.ClassroomService;
import com.faceattend_edu.academic.domain.dto.patch.ClassroomPatch;
import com.faceattend_edu.academic.domain.dto.request.ClassroomRequest;
import com.faceattend_edu.academic.domain.dto.response.ClassroomResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/classrooms")
public class ClassroomController extends AbstractController<ClassroomResponse, ClassroomRequest, ClassroomPatch, Integer> {

    private final ClassroomService service;

    @Override
    protected AbstractService<ClassroomRequest, ClassroomResponse, ClassroomPatch, Integer> getService() {
        return service;
    }
}
