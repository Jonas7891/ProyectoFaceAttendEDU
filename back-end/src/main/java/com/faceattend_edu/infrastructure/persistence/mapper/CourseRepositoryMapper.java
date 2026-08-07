package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.infrastructure.persistence.entity.CourseEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseRepositoryMapper {

    CourseEntity toEntity(Course course);

    Course toDomain(CourseEntity entity);
}
