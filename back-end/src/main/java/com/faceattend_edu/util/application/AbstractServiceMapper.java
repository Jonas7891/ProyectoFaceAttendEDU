package com.faceattend_edu.util.application;

import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

public interface AbstractServiceMapper<Model, Request, Response, Patch> {
    Model toDomain(Request request);

    Response toResponse(Model model);

    void updateDomain(@MappingTarget Model existing, Request request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(@MappingTarget Model existing, Patch patch);
}
