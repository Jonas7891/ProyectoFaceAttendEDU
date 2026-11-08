package com.faceattend_edu.attendance_service.application.usecase;

import com.faceattend_edu.attendance_service.domain.exception.ValidationException;
import com.faceattend_edu.attendance_service.domain.model.AttendanceReport;
import com.faceattend_edu.attendance_service.domain.port.in.GetAttendanceReportUseCase;
import com.faceattend_edu.attendance_service.domain.port.out.AttendanceStatsPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetAttendanceReportUseCaseImpl implements GetAttendanceReportUseCase {

    private final AttendanceStatsPort stats;

    @Override
    public AttendanceReport report(Collection<Long> classSessionIds, Collection<Long> academicActorIds,
                                   Set<Long> visibleActorIds) {
        boolean bySessions = classSessionIds != null && !classSessionIds.isEmpty();
        boolean byActors = academicActorIds != null && !academicActorIds.isEmpty();
        if (!bySessions && !byActors) {
            throw new ValidationException("Provide classSessionIds and/or academicActorIds to scope the report");
        }
        if ((bySessions && classSessionIds.size() > MAX_IDS) || (byActors && academicActorIds.size() > MAX_IDS)) {
            throw new ValidationException("classSessionIds and academicActorIds accept at most " + MAX_IDS + " ids each");
        }
        List<AttendanceReport.Row> rows = stats.countByGroups(
                        bySessions ? Set.copyOf(classSessionIds) : null,
                        byActors ? Set.copyOf(academicActorIds) : null)
                .stream()
                .filter(row -> visible(row.academicActorId(), visibleActorIds))
                .toList();
        return AttendanceReport.from(rows);
    }

    @Override
    public Map<Long, AttendanceReport.Counts> summaryByActor(Collection<Long> academicActorIds, Set<Long> visibleActorIds) {
        if (academicActorIds == null || academicActorIds.isEmpty()) return Map.of();
        if (academicActorIds.size() > MAX_SUMMARY_ACTORS) {
            throw new ValidationException("academicActorIds accepts at most " + MAX_SUMMARY_ACTORS + " ids per request");
        }
        Set<Long> asked = academicActorIds.stream()
                .filter(id -> visible(id, visibleActorIds))
                .collect(Collectors.toSet());
        if (asked.isEmpty()) return Map.of();
        return AttendanceReport.from(stats.countByActors(asked)).getByActor();
    }

    private static boolean visible(Long actorId, Set<Long> visibleActorIds) {
        return visibleActorIds == null || (actorId != null && visibleActorIds.contains(actorId));
    }
}
