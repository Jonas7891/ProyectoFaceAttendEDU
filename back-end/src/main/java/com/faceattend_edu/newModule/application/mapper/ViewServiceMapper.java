package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.ViewPatch;
import com.faceattend_edu.newModule.domain.dto.request.ViewRequest;
import com.faceattend_edu.newModule.domain.dto.response.ViewResponse;
import com.faceattend_edu.newModule.domain.model.Action;
import com.faceattend_edu.newModule.domain.model.View;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import com.faceattend_edu.util.application.ReferenceMapperUtils;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ViewServiceMapper
        extends AbstractServiceMapper<View, ViewRequest, ViewResponse, ViewPatch> {

    @Override
    @Mapping(source = "actionIds", target = "actions")
    View toDomain(ViewRequest viewRequest);

    default List<Action> mapViewIds(List<Integer> actionIds) {
        return ReferenceMapperUtils.toReferences(actionIds, Action::new, Action::setId);
    }
}
