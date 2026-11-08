package com.faceattend_edu.scheduling_service.infrastructure.web.controller;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.application.usecase.ListClassSessionsUseCaseImpl;
import com.faceattend_edu.scheduling_service.application.usecase.ListScheduleBlocksUseCaseImpl;
import com.faceattend_edu.scheduling_service.domain.exception.OutOfScopeException;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.model.Environment;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlockFilter;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import com.faceattend_edu.scheduling_service.domain.port.out.EnvironmentRepository;
import com.faceattend_edu.scheduling_service.domain.port.out.ScheduleBlockRepository;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.ClassSessionWebMapper;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.ScheduleBlockWebMapper;
import com.faceattend_edu.scheduling_service.infrastructure.web.security.AuthTokenFilter;
import com.faceattend_edu.scheduling_service.infrastructure.web.security.CallerSchoolResolver.CallerSchool;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Blocks and sessions have no school of their own: they are scoped through their environment. */
@DisplayName("Schedule relations stay inside the caller's school")
class ScheduleRelationsControllerTest {

    private final ScheduleBlockRepository blocks = mock(ScheduleBlockRepository.class);
    private final ClassSessionRepository sessions = mock(ClassSessionRepository.class);
    private final EnvironmentRepository environments = mock(EnvironmentRepository.class);
    private final SchedulingAccessPolicy access = new SchedulingAccessPolicy(blocks, environments);
    private final ScheduleRelationsController controller = new ScheduleRelationsController(
            new ListScheduleBlocksUseCaseImpl(blocks), new ListClassSessionsUseCaseImpl(sessions, blocks, access),
            new ScheduleBlockWebMapper(), new ClassSessionWebMapper());

    private static ScheduleBlock block(long id, long cohort, int environment, long instructor) {
        ScheduleBlock b = new ScheduleBlock();
        b.setScheduleBlockId(id);
        b.setCohortId(cohort);
        b.setCourseId(1);
        b.setEnvironmentId(environment);
        b.setInstructorActorId(instructor);
        b.setDayOfWeek((short) 1);
        b.setStartsAt(LocalTime.of(7, 0));
        b.setEndsAt(LocalTime.of(9, 0));
        return b;
    }

    private static Environment environmentOf(int school) {
        Environment e = new Environment();
        e.setSchoolId(school);
        return e;
    }

    private static void callerIs(CallerSchool caller) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        if (caller != null) request.setAttribute(AuthTokenFilter.CALLER_SCHOOL_ATTRIBUTE, caller);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    @BeforeEach
    void setUp() {
        // Environment 10 is in school 1, environment 20 in school 2; block 2 sits in environment 20.
        when(environments.findById(10)).thenReturn(Optional.of(environmentOf(1)));
        when(environments.findById(20)).thenReturn(Optional.of(environmentOf(2)));
        when(blocks.findById(2L)).thenReturn(Optional.of(block(2, 100, 20, 7)));
        ClassSession session = new ClassSession();
        session.setClassSessionId(50L);
        session.setScheduleBlockId(2L);
        session.setSessionDate(LocalDate.of(2026, 10, 5));
        session.setSessionStatus("Open");
        when(sessions.findByScheduleBlockId(2L)).thenReturn(List.of(session));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void anAdministradorListsBlocksFilteredByItsOwnSchoolInTheQuery() {
        callerIs(new CallerSchool(false, 1, 5L));
        when(blocks.search(ScheduleBlockFilter.byCohort(100L), 1)).thenReturn(List.of(block(1, 100, 10, 7)));
        assertThat(controller.blocksByCohort(100L).getBody()).extracting("scheduleBlockId").containsExactly(1L);

        controller.blocksByActor(7L);
        verify(blocks).search(ScheduleBlockFilter.byInstructor(7L), 1);
        controller.blocksByEnvironment(20);
        verify(blocks).search(ScheduleBlockFilter.byEnvironment(20), 1);
    }

    @Test
    void superAdministradorSearchesWithoutASchool() {
        callerIs(new CallerSchool(true, null, null));
        when(blocks.search(ScheduleBlockFilter.byCohort(100L), null)).thenReturn(List.of(block(1, 100, 10, 7), block(2, 100, 20, 7)));
        assertThat(controller.blocksByCohort(100L).getBody()).hasSize(2);
        verify(blocks).search(any(), isNull());
    }

    @Test
    void aCallerWithoutASchoolSeesNothing() {
        callerIs(new CallerSchool(false, null, null));
        assertThat(controller.blocksByCohort(100L).getBody()).isEmpty();
        verify(blocks, never()).search(any(), any());
    }

    @Test
    void sessionsOfAForeignBlockLookMissing() {
        callerIs(new CallerSchool(false, 1, 5L));
        assertThatThrownBy(() -> controller.sessionsByBlock(2L)).isInstanceOf(OutOfScopeException.class);

        callerIs(new CallerSchool(false, 2, 6L));
        assertThat(controller.sessionsByBlock(2L).getBody()).extracting("classSessionId").containsExactly(50L);

        callerIs(null);
        assertThat(controller.sessionsByBlock(2L).getBody()).hasSize(1);
    }
}
