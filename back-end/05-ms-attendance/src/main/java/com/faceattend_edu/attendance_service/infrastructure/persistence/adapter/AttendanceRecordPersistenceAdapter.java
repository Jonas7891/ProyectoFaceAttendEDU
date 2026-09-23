package com.faceattend_edu.attendance_service.infrastructure.persistence.adapter;

import com.faceattend_edu.attendance_service.domain.model.AttendanceRecord;
import com.faceattend_edu.attendance_service.domain.port.out.AttendanceRecordRepository;
import com.faceattend_edu.attendance_service.infrastructure.persistence.mapper.AttendanceRecordPersistenceMapper;
import com.faceattend_edu.attendance_service.infrastructure.persistence.repository.AttendanceRecordJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AttendanceRecordPersistenceAdapter implements AttendanceRecordRepository {
    private final AttendanceRecordJpaRepository jpaRepository;
    private final AttendanceRecordPersistenceMapper mapper;
    @Override public AttendanceRecord save(AttendanceRecord d){ return mapper.toDomain(jpaRepository.save(mapper.toEntity(d))); }
    @Override public Optional<AttendanceRecord> findById(Long id){ return jpaRepository.findById(id).map(mapper::toDomain); }
    @Override public Optional<AttendanceRecord> findByClassSessionIdAndAcademicActorId(Long s, Long a){ return jpaRepository.findByClassSessionIdAndAcademicActorId(s,a).map(mapper::toDomain); }
    @Override public List<AttendanceRecord> findAll(){ return jpaRepository.findAll().stream().map(mapper::toDomain).collect(Collectors.toList()); }
    @Override public List<AttendanceRecord> findByClassSessionId(Long s){ return jpaRepository.findByClassSessionId(s).stream().map(mapper::toDomain).collect(Collectors.toList()); }
    @Override public void deleteById(Long id){ jpaRepository.deleteById(id); }
    @Override public boolean existsById(Long id){ return jpaRepository.existsById(id); }
}
