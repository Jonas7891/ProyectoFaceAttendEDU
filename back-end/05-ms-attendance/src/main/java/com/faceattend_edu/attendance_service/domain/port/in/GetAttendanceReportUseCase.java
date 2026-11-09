package com.faceattend_edu.attendance_service.domain.port.in;

import com.faceattend_edu.attendance_service.domain.model.AttendanceReport;

import java.util.Collection;
import java.util.Map;
import java.util.Set;

/**
 * Attendance reports computed on the fly. This service knows sessions and actors only by id
 * (their date and cohort live in Scheduling and Academic), so the caller picks the scope.
 *
 * <p>{@code visibleActorIds} is the caller's actor scope: null means unrestricted, otherwise
 * only those actors are counted.</p>
 */
public interface GetAttendanceReportUseCase {

    /** Most ids accepted per dimension. */
    int MAX_IDS = 1_000;

    /** Most actors one summary accepts: it keeps the query string within any sane URL limit. */
    int MAX_SUMMARY_ACTORS = 300;

    /** Counts per status, by actor and by session; ValidationException without any scope or over MAX_IDS. */
    AttendanceReport report(Collection<Long> classSessionIds, Collection<Long> academicActorIds, Set<Long> visibleActorIds);

    /** Counts per actor, in id order; actors outside the scope or without records are absent. */
    Map<Long, AttendanceReport.Counts> summaryByActor(Collection<Long> academicActorIds, Set<Long> visibleActorIds);
}
