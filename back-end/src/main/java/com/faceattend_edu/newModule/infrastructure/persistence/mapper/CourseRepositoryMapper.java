package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.Course;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.CourseEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseRepositoryMapper extends AbstractRepositoryMapper<CourseEntity, Course> {
}
