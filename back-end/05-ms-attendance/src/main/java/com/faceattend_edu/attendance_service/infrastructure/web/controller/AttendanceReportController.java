package com.faceattend_edu.attendance_service.infrastructure.web.controller;

import com.faceattend_edu.attendance_service.domain.model.AttendanceReport;
import com.faceattend_edu.attendance_service.domain.port.in.GetAttendanceReportUseCase;
import com.faceattend_edu.attendance_service.infrastructure.web.security.ActorScope;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * HTTP adapter for attendance reports: picks the output format; the counting and the caller's
 * scope are the use case's job. The caller resolves the sessions of a cohort or a date range
 * from Scheduling and passes their ids here.
 */
@RestController
@RequestMapping({"/api/v1/attendance-reports", "/attendance-reports"})
@RequiredArgsConstructor
public class AttendanceReportController {

    private static final MediaType CSV = MediaType.parseMediaType("text/csv");

    private final GetAttendanceReportUseCase reportUseCase;

    @GetMapping
    public ResponseEntity<?> report(
            @RequestParam(name = "classSessionIds", required = false) List<Long> classSessionIds,
            @RequestParam(name = "academicActorIds", required = false) List<Long> academicActorIds,
            @RequestParam(name = "format", defaultValue = "json") String format) {
        boolean csv = format.equalsIgnoreCase("csv");
        if (!csv && !format.equalsIgnoreCase("json")) {
            throw new IllegalArgumentException("format must be json or csv");
        }
        AttendanceReport report = reportUseCase.report(classSessionIds, academicActorIds, ActorScope.actorIds());

        if (csv) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendance-report.csv\"")
                    .contentType(CSV)
                    .body(report.toCsv());
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("generatedAt", Instant.now().toString());
        body.put("filters", Map.of(
                "classSessionIds", classSessionIds == null ? List.of() : classSessionIds,
                "academicActorIds", academicActorIds == null ? List.of() : academicActorIds));
        body.putAll(report.toResponse());
        return ResponseEntity.ok(body);
    }
}
