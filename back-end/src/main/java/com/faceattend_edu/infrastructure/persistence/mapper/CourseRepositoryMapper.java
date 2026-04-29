package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.CourseRequest;
import com.faceattend_edu.domain.dto.response.CourseResponse;
import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.infrastructure.persistence.entity.CourseEntity;
import com.faceattend_edu.infrastructure.persistence.entity.SchoolEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface CourseRepositoryMapper {

    CourseEntity toEntity(Course course);

    Course toDomain(CourseEntity entity);
}
