package com.faceattend_edu.attendance_service.domain.port.out;

import com.faceattend_edu.attendance_service.domain.model.AttendanceRecord;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository {
    AttendanceRecord save(AttendanceRecord r);
    Optional<AttendanceRecord> findById(Long id);
    Optional<AttendanceRecord> findByClassSessionIdAndAcademicActorId(Long sessionId, Long actorId);
    List<AttendanceRecord> findAll();
    List<AttendanceRecord> findByClassSessionId(Long sessionId);
    void deleteById(Long id);
    boolean existsById(Long id);
}
