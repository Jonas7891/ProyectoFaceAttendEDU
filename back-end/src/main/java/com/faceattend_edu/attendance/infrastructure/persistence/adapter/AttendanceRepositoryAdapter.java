package com.faceattend_edu.attendance.infrastructure.persistence.adapter;

import com.faceattend_edu.attendance.domain.model.Attendance;
import com.faceattend_edu.attendance.domain.port.AttendanceRepositoryPort;
import com.faceattend_edu.attendance.infrastructure.persistence.entity.AttendanceEntity;
import com.faceattend_edu.attendance.infrastructure.persistence.mapper.AttendanceRepositoryMapper;
import com.faceattend_edu.attendance.infrastructure.persistence.repository.AttendanceJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@AllArgsConstructor
public class AttendanceRepositoryAdapter
        extends AbstractRepositoryAdapter<AttendanceEntity, Attendance, Long>
        implements AttendanceRepositoryPort {

    private final AttendanceJpaRepository jpaRepository;
    private final AttendanceRepositoryMapper mapper;

    @Override
    protected JpaRepository<AttendanceEntity, Long> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<Attendance, AttendanceEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<AttendanceEntity, Attendance> toDomainMapper() {
        return mapper::toDomain;
    }
}
