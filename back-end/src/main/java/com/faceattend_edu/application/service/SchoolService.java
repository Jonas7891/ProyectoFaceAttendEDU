package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.SchoolRequest;
import com.faceattend_edu.domain.dto.response.SchoolResponse;

import java.util.List;

public interface SchoolService {

    SchoolResponse findById(Integer id);

    List<SchoolResponse> findAll();

    SchoolResponse save(SchoolRequest request);

    SchoolResponse update(Integer id, SchoolRequest request);

    void deleteById(Integer id);
}
