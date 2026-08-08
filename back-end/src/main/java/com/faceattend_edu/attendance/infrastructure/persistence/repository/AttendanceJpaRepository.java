package com.faceattend_edu.attendance.infrastructure.persistence.repository;

import com.faceattend_edu.attendance.infrastructure.persistence.entity.AttendanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceJpaRepository extends JpaRepository<AttendanceEntity, Long> {
}
