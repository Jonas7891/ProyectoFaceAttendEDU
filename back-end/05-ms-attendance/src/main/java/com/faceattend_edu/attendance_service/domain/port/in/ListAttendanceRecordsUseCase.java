package com.faceattend_edu.attendance_service.domain.port.in;

import com.faceattend_edu.attendance_service.domain.model.AttendanceRecord;
import java.util.List;

public interface ListAttendanceRecordsUseCase {
    List<AttendanceRecord> list();
    List<AttendanceRecord> listBySession(Long sessionId);
    List<AttendanceRecord> listByActor(Long actorId);
}
