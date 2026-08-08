package com.faceattend_edu.academic.infrastructure.persistence.mapper;

import com.faceattend_edu.academic.domain.model.Course;
import com.faceattend_edu.academic.infrastructure.persistence.entity.CourseEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseRepositoryMapper extends AbstractRepositoryMapper<CourseEntity, Course> {
}
