package com.faceattend_edu.attendance_service.domain.port.out;

import com.faceattend_edu.attendance_service.domain.model.AttendanceReport;

import java.util.Collection;
import java.util.List;

/** Attendance counts aggregated by the database, never by loading every record. */
public interface AttendanceStatsPort {

    /**
     * Live records counted per (session, actor, status). A null or empty collection does not
     * filter on that dimension; at least one of them should be given.
     */
    List<AttendanceReport.Row> countByGroups(Collection<Long> classSessionIds, Collection<Long> academicActorIds);

    /** Live records of these actors counted per (actor, status); the rows carry no session. */
    List<AttendanceReport.Row> countByActors(Collection<Long> academicActorIds);
}
