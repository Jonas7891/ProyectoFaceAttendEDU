package com.faceattend_edu.util.application;

import com.faceattend_edu.domain.dto.request.ActionRequest;
import com.faceattend_edu.domain.dto.response.ActionResponse;

import java.util.List;

public interface AbstractService<Request, Response, ID> {

    Response findById(ID id);

    List<Response> findAll();

    Response save(Request request);

    Response update(ID id, Request request);

    void deleteById(ID id);
}
