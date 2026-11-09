package com.faceattend_edu.attendance_service.infrastructure.persistence.adapter;

import com.faceattend_edu.attendance_service.domain.model.AttendanceReport;
import com.faceattend_edu.attendance_service.domain.port.out.AttendanceStatsPort;
import com.faceattend_edu.attendance_service.infrastructure.persistence.repository.AttendanceRecordJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Set;

/** Group-by queries over attendance_record (indexes uq_attendance_session_actor, idx_attendance_actor). */
@Component
@RequiredArgsConstructor
public class AttendanceStatsPersistenceAdapter implements AttendanceStatsPort {

    /** An unused filter gets a placeholder set (an empty IN is not valid SQL); its flag switches it off. */
    private static final Set<Long> PLACEHOLDER = Set.of(-1L);

    private final AttendanceRecordJpaRepository jpaRepository;

    @Override
    public List<AttendanceReport.Row> countByGroups(Collection<Long> classSessionIds, Collection<Long> academicActorIds) {
        boolean bySessions = classSessionIds != null && !classSessionIds.isEmpty();
        boolean byActors = academicActorIds != null && !academicActorIds.isEmpty();
        return jpaRepository.countByGroups(
                        bySessions, bySessions ? classSessionIds : PLACEHOLDER,
                        byActors, byActors ? academicActorIds : PLACEHOLDER)
                .stream()
                .map(r -> new AttendanceReport.Row(r.getClassSessionId(), r.getAcademicActorId(), r.getAttendanceStatus(), r.getTotal()))
                .toList();
    }

    @Override
    public List<AttendanceReport.Row> countByActors(Collection<Long> academicActorIds) {
        if (academicActorIds == null || academicActorIds.isEmpty()) return List.of();
        return jpaRepository.summarizeByActors(academicActorIds).stream()
                .map(r -> new AttendanceReport.Row(null, r.getAcademicActorId(), r.getAttendanceStatus(), r.getTotal()))
                .toList();
    }
}
