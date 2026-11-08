package com.faceattend_edu.attendance_service.application.policy;

import com.faceattend_edu.attendance_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.attendance_service.domain.exception.ValidationException;
import com.faceattend_edu.attendance_service.domain.port.out.ClassSessionStatusPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Attendance is taken while the class is Open. Once it is Closed only Absent may still be
 * recorded: that is how Notification marks, after the close, the students who never arrived.
 * A Cancelled class takes no attendance. When Scheduling cannot say, the record is refused
 * (503) rather than trusting the client.
 */
@Component
@RequiredArgsConstructor
public class SessionOpenPolicy {

    private final ClassSessionStatusPort sessions;

    public void requireAccepts(Long classSessionId, String attendanceStatus) {
        String status = sessions.statusOf(classSessionId)
                .orElseThrow(() -> new EntityNotFoundException("ClassSession", classSessionId));
        if ("Open".equals(status)) return;
        if ("Closed".equals(status) && "Absent".equals(attendanceStatus)) return;
        throw new ValidationException("Attendance can only be recorded in an Open class session; session "
                + classSessionId + " is " + status);
    }
}
