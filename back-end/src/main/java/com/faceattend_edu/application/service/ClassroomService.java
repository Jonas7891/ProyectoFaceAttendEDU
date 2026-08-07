package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.ClassroomRequest;
import com.faceattend_edu.domain.dto.response.ClassroomResponse;

import java.util.List;

public interface ClassroomService {

    ClassroomResponse findById(Integer id);

    List<ClassroomResponse> findAll();

    ClassroomResponse save(ClassroomRequest request);

    ClassroomResponse update(Integer id, ClassroomRequest request);

    void deleteById(Integer id);
}
