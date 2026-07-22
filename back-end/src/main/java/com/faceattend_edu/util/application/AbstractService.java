package com.faceattend_edu.util.application;

import java.util.List;

public interface AbstractService<Request, Response, Patch, ID> {

    Response findById(ID id);

    List<Response> findAll();

    Response save(Request request);

    Response update(ID id, Request request);

    void deleteById(ID id);

    void logicalDelete(ID id);

    void partialUpdate(ID id, Patch patch);
}
