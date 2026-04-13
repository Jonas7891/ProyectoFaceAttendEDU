package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.ActionRequest;
import com.faceattend_edu.domain.dto.response.ActionResponse;

import java.util.List;

public interface ActionService {

    ActionResponse findById(Integer id);

    List<ActionResponse> findAll();

    ActionResponse save(ActionRequest request);

    ActionResponse update(Integer id, ActionRequest request);

    void deleteById(Integer id);
}
