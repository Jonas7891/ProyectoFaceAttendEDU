package com.faceattend_edu.attendance_service.domain.model;
import java.time.Instant;
public class AttendanceRecord {
    private Long attendanceRecordId; private Long classSessionId; private Long academicActorId;
    private String attendanceStatus; private String captureMethod; private Double matchScore;
    private Instant capturedAt;
}
