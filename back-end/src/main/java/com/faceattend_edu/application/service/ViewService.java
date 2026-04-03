package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.ViewRequest;
import com.faceattend_edu.domain.dto.response.ViewResponse;

import java.util.List;

public interface ViewService {

    ViewResponse findById(Integer id);

    List<ViewResponse> findAll();

    ViewResponse save(ViewRequest request);

    ViewResponse update(Integer id, ViewRequest request);

    void deleteById(Integer id);
}
