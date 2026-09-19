package com.faceattend_edu.attendance_service.infrastructure.persistence.repository;

import com.faceattend_edu.attendance_service.infrastructure.persistence.entity.AttendanceRecordJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordJpaRepository extends JpaRepository<AttendanceRecordJpaEntity, Long> {
    Optional<AttendanceRecordJpaEntity> findByClassSessionIdAndAcademicActorId(Long classSessionId, Long academicActorId);
    List<AttendanceRecordJpaEntity> findByClassSessionId(Long classSessionId);
}
