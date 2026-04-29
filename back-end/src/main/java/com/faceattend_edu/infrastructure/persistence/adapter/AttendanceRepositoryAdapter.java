package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.domain.port.AttendanceRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.AttendanceEntity;
import com.faceattend_edu.infrastructure.persistence.entity.IotDeviceEntity;
import com.faceattend_edu.infrastructure.persistence.entity.PersonEntity;
import com.faceattend_edu.infrastructure.persistence.entity.ScheduleEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.AttendanceRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.AttendanceJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class AttendanceRepositoryAdapter implements AttendanceRepositoryPort {

    private final AttendanceJpaRepository jpaRepository;
    private final AttendanceRepositoryMapper mapper;

    @Override
    public Attendance save(Attendance attendance) {
        AttendanceEntity entity = mapper.toEntity(attendance);
        AttendanceEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Attendance> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Attendance> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

}
