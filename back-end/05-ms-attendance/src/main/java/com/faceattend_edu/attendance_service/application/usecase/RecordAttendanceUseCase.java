package com.faceattend_edu.attendance_service.application.usecase;
import org.springframework.transaction.annotation.Transactional;
public class RecordAttendanceUseCase {
    @Transactional
    public void execute(Long sessionId, Long actorId, String method) { /* ACID */ }
}
