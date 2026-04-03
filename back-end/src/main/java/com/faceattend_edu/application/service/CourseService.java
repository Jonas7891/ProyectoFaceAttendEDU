package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.CourseRequest;
import com.faceattend_edu.domain.dto.response.CourseResponse;

import java.util.List;

public interface CourseService {

    CourseResponse findById(Integer id);

    List<CourseResponse> findAll();

    CourseResponse save(CourseRequest request);

    CourseResponse update(Integer id, CourseRequest request);

    void deleteById(Integer id);
}
