package com.faceattend_edu.attendance_service.application.usecase;

import com.faceattend_edu.attendance_service.domain.exception.ValidationException;
import com.faceattend_edu.attendance_service.domain.model.AttendanceReport;
import com.faceattend_edu.attendance_service.infrastructure.persistence.adapter.AttendanceStatsPersistenceAdapter;
import com.faceattend_edu.attendance_service.infrastructure.persistence.repository.ActorAttendanceCount;
import com.faceattend_edu.attendance_service.infrastructure.persistence.repository.AttendanceGroupCount;
import com.faceattend_edu.attendance_service.infrastructure.persistence.repository.AttendanceRecordJpaRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.LongStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** The report and the per-actor summary count in SQL and keep to the caller's actor scope. */
class GetAttendanceReportUseCaseImplTest {

    private final AttendanceRecordJpaRepository jpa = mock(AttendanceRecordJpaRepository.class);
    private final GetAttendanceReportUseCaseImpl useCase =
            new GetAttendanceReportUseCaseImpl(new AttendanceStatsPersistenceAdapter(jpa));

    private record Group(Long getClassSessionId, Long getAcademicActorId, String getAttendanceStatus, long getTotal)
            implements AttendanceGroupCount {
    }

    private record ActorCount(Long getAcademicActorId, String getAttendanceStatus, long getTotal)
            implements ActorAttendanceCount {
    }

    @Test
    void theReportLeavesOutActorsOutsideTheScopeAndOnlyFiltersTheGivenDimensions() {
        when(jpa.countByGroups(eq(true), eq(Set.of(100L)), eq(false), eq(Set.of(-1L)))).thenReturn(List.of(
                new Group(100L, 1L, "Present", 3), new Group(100L, 2L, "Absent", 1)));

        AttendanceReport all = useCase.report(List.of(100L), null, null);
        assertThat(all.getTotals().getTotal()).isEqualTo(4);

        AttendanceReport scoped = useCase.report(List.of(100L), List.of(), Set.of(1L));
        assertThat(scoped.getByActor()).containsOnlyKeys(1L);
        assertThat(scoped.getTotals().getPresent()).isEqualTo(3);
    }

    @Test
    void aReportNeedsAScopeAndBoundedIds() {
        assertThatThrownBy(() -> useCase.report(null, List.of(), null)).isInstanceOf(ValidationException.class);
        List<Long> tooMany = LongStream.rangeClosed(1, 1_001).boxed().toList();
        assertThatThrownBy(() -> useCase.report(null, tooMany, null))
                .isInstanceOf(ValidationException.class).hasMessageContaining("at most 1000");
        verify(jpa, never()).countByGroups(anyBoolean(), any(), anyBoolean(), any());
    }

    @Test
    void theSummaryCountsVisibleActorsOnly() {
        when(jpa.summarizeByActors(Set.of(1L))).thenReturn(List.of(
                new ActorCount(1L, "Present", 2), new ActorCount(1L, "Late", 1), new ActorCount(1L, "Justified", 1)));

        Map<Long, AttendanceReport.Counts> summary = useCase.summaryByActor(List.of(1L, 2L), Set.of(1L));

        assertThat(summary).containsOnlyKeys(1L);
        assertThat(summary.get(1L).getTotal()).isEqualTo(4);
        assertThat(summary.get(1L).getLate()).isEqualTo(1);
    }

    @Test
    void anEmptyOrHiddenSummaryAsksNothingAndTooManyActorsIs400() {
        assertThat(useCase.summaryByActor(null, null)).isEmpty();
        assertThat(useCase.summaryByActor(List.of(5L), Set.of(1L))).isEmpty();
        verify(jpa, never()).summarizeByActors(any());

        List<Long> tooMany = LongStream.rangeClosed(1, 301).boxed().toList();
        assertThatThrownBy(() -> useCase.summaryByActor(tooMany, null))
                .isInstanceOf(ValidationException.class).hasMessageContaining("at most 300");
        assertThat(new AttendanceStatsPersistenceAdapter(jpa).countByActors(List.of())).isEmpty();
    }
}
