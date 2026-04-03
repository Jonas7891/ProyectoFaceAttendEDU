package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.ViewActionRequest;
import com.faceattend_edu.domain.dto.response.ViewActionResponse;

import java.util.List;

public interface ViewActionService {

    ViewActionResponse findById(Integer id);

    List<ViewActionResponse> findAll();

    ViewActionResponse save(ViewActionRequest request);

    ViewActionResponse update(Integer id, ViewActionRequest request);

    void deleteById(Integer id);
}
