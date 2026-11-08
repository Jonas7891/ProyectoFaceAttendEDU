package com.faceattend_edu.scheduling_service.infrastructure.web.controller;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.application.usecase.CancelClassSessionUseCaseImpl;
import com.faceattend_edu.scheduling_service.application.usecase.CloseClassSessionUseCaseImpl;
import com.faceattend_edu.scheduling_service.application.usecase.CreateClassSessionUseCaseImpl;
import com.faceattend_edu.scheduling_service.application.usecase.DeleteClassSessionUseCaseImpl;
import com.faceattend_edu.scheduling_service.application.usecase.GetClassSessionUseCaseImpl;
import com.faceattend_edu.scheduling_service.application.usecase.ListClassSessionsUseCaseImpl;
import com.faceattend_edu.scheduling_service.application.usecase.OpenClassSessionUseCaseImpl;
import com.faceattend_edu.scheduling_service.application.usecase.UpdateClassSessionUseCaseImpl;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.model.ClassSessionFilter;
import com.faceattend_edu.scheduling_service.domain.model.Environment;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import com.faceattend_edu.scheduling_service.domain.port.out.EnvironmentRepository;
import com.faceattend_edu.scheduling_service.domain.port.out.ScheduleBlockRepository;
import com.faceattend_edu.scheduling_service.infrastructure.messaging.DomainEventPublisher;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.ClassSessionWebMapper;
import com.faceattend_edu.scheduling_service.infrastructure.web.security.AuthTokenFilter;
import com.faceattend_edu.scheduling_service.infrastructure.web.security.CallerSchoolResolver.CallerSchool;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Cobertura HTTP (MockMvc) de {@code ClassSessionController} con los casos de uso reales.
 *
 * <p>Solo se simulan los puertos de salida (repositorios y publicador de eventos): así cada
 * escenario recorre la regla de acceso ({@code SchedulingAccessPolicy}), el ciclo de vida
 * ({@code ClassSession}) y el mapeo de errores del {@code GlobalExceptionHandler}, que es lo que
 * el controlador delgado ya no decide por sí mismo.</p>
 */
@WebMvcTest(controllers = ClassSessionController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({ClassSessionWebMapper.class, SchedulingAccessPolicy.class,
        CreateClassSessionUseCaseImpl.class, UpdateClassSessionUseCaseImpl.class, GetClassSessionUseCaseImpl.class,
        ListClassSessionsUseCaseImpl.class, DeleteClassSessionUseCaseImpl.class, OpenClassSessionUseCaseImpl.class,
        CloseClassSessionUseCaseImpl.class, CancelClassSessionUseCaseImpl.class})
@DisplayName("IEEE 829 TC-04-002: ClassSessionController HTTP tests (MockMvc)")
class ClassSessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClassSessionRepository sessions;
    @MockitoBean
    private ScheduleBlockRepository blocks;
    @MockitoBean
    private EnvironmentRepository environments;
    @MockitoBean
    private DomainEventPublisher eventPublisher;

    private ClassSession openSession;

    @BeforeEach
    void setUp() {
        openSession = new ClassSession();
        openSession.setClassSessionId(5L);
        openSession.setScheduleBlockId(100L);
        openSession.setSessionDate(LocalDate.of(2026, 3, 2));
        openSession.setSessionStatus("Open");
        openSession.setRowVersion(1L);
        when(sessions.save(any())).thenAnswer(inv -> {
            ClassSession saved = inv.getArgument(0);
            if (saved.getClassSessionId() == null) saved.setClassSessionId(5L);
            return saved;
        });
    }

    private static ClassSession withStatus(ClassSession base, String status) {
        ClassSession copy = new ClassSession();
        copy.setClassSessionId(base.getClassSessionId());
        copy.setScheduleBlockId(base.getScheduleBlockId());
        copy.setSessionDate(base.getSessionDate());
        copy.setSessionStatus(status);
        copy.setRowVersion(2L);
        return copy;
    }

    /** Session 5 lives in block 100 (environment 3, school 7), taught by {@code instructorActorId}. */
    private void session5InBlockTaughtBy(ClassSession session, long instructorActorId) {
        when(sessions.findById(5L)).thenReturn(Optional.of(session));
        when(blocks.findById(100L)).thenReturn(Optional.of(block(100L, instructorActorId)));
        Environment environment = new Environment();
        environment.setSchoolId(7);
        when(environments.findById(3)).thenReturn(Optional.of(environment));
    }

    private static ScheduleBlock block(long id, long instructorActorId) {
        ScheduleBlock block = new ScheduleBlock();
        block.setScheduleBlockId(id);
        block.setEnvironmentId(3);
        block.setInstructorActorId(instructorActorId);
        return block;
    }

    /** A caller of school 7 whose own actor is {@code ownActorId}, as AuthTokenFilter would resolve it. */
    private static MockHttpServletRequestBuilder as(MockHttpServletRequestBuilder request, long ownActorId, String role) {
        return request
                .requestAttr(AuthTokenFilter.CALLER_SCHOOL_ATTRIBUTE, new CallerSchool(false, 7, ownActorId))
                .requestAttr("X-User-Roles", List.of(role))
                .contentType(MediaType.APPLICATION_JSON);
    }

    @Nested
    @DisplayName("GET /api/v1/class-sessions filters")
    class ListFilterTests {

        @Test
        @DisplayName("givenDateRangeAndStatus_whenList_thenTheFilterReachesTheQueryWithTheStoredSpelling")
        void givenDateRangeAndStatus_whenList_thenTheFilterReachesTheQuery() throws Exception {
            ClassSession inside = withStatus(openSession, "Closed");
            inside.setClassSessionId(2L);
            ClassSessionFilter expected = new ClassSessionFilter(null, LocalDate.of(2026, 3, 2), LocalDate.of(2026, 3, 8), "Closed");
            when(sessions.search(expected, null)).thenReturn(List.of(inside));

            mockMvc.perform(get("/api/v1/class-sessions")
                            .param("from", "2026-03-02")
                            .param("to", "2026-03-08")
                            .param("sessionStatus", "closed"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].classSessionId").value(2));
        }

        @Test
        @DisplayName("givenAStatusThatDoesNotExist_whenList_thenEmptyWithoutQuerying")
        void givenAStatusThatDoesNotExist_whenList_thenEmpty() throws Exception {
            mockMvc.perform(get("/api/v1/class-sessions").param("sessionStatus", "Paused"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
            verify(sessions, never()).search(any(), any());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/class-sessions school scope (AUD-35)")
    class SchoolScopedListTests {

        @Test
        @DisplayName("givenSchoolScopedCaller_whenList_thenTheQueryIsScopedToItsSchool")
        void givenSchoolScopedCaller_whenList_thenTheQueryIsScopedToItsSchool() throws Exception {
            // Orphan sessions (block or environment soft-deleted) drop out inside the query itself.
            when(sessions.search(ClassSessionFilter.NONE, 1)).thenReturn(List.of(openSession));

            mockMvc.perform(get("/api/v1/class-sessions")
                            .requestAttr(AuthTokenFilter.CALLER_SCHOOL_ATTRIBUTE, new CallerSchool(false, 1, 5L)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].classSessionId").value(5));
        }

        @Test
        @DisplayName("givenCallerWithoutSchool_whenList_thenEmpty")
        void givenCallerWithoutSchool_whenList_thenEmpty() throws Exception {
            mockMvc.perform(get("/api/v1/class-sessions")
                            .requestAttr(AuthTokenFilter.CALLER_SCHOOL_ATTRIBUTE, new CallerSchool(false, null, null)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
            verify(sessions, never()).search(any(), any());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/class-sessions")
    class CreateTests {

        @Test
        @DisplayName("givenValidRequest_whenCreateClassSession_thenReturn201WithDefaultOpenStatus")
        void givenValidRequest_whenCreateClassSession_thenReturn201WithDefaultOpenStatus() throws Exception {
            mockMvc.perform(post("/api/v1/class-sessions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"scheduleBlockId":100,"sessionDate":"2026-03-02"}"""))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.classSessionId").value(5))
                    .andExpect(jsonPath("$.scheduleBlockId").value(100))
                    .andExpect(jsonPath("$.sessionDate").value("2026-03-02"))
                    .andExpect(jsonPath("$.sessionStatus").value("Open"));

            ArgumentCaptor<ClassSession> captor = ArgumentCaptor.forClass(ClassSession.class);
            verify(sessions).save(captor.capture());
            assertEquals("Open", captor.getValue().getSessionStatus());
            assertEquals(LocalDate.of(2026, 3, 2), captor.getValue().getSessionDate());
            verify(eventPublisher).publish(eq("class-session-events"), anyString());
        }

        @Test
        @DisplayName("givenMissingSessionDate_whenCreateClassSession_thenReturn400FieldError")
        void givenMissingSessionDate_whenCreateClassSession_thenReturn400FieldError() throws Exception {
            mockMvc.perform(post("/api/v1/class-sessions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"scheduleBlockId":100}"""))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("sessionDate: must not be null"));

            verify(sessions, never()).save(any());
        }
    }

    @Nested
    @DisplayName("GET/PUT/DELETE /api/v1/class-sessions")
    class CrudTests {

        @Test
        @DisplayName("givenExistingId_whenGetClassSession_thenReturn200Json")
        void givenExistingId_whenGetClassSession_thenReturn200Json() throws Exception {
            when(sessions.findById(5L)).thenReturn(Optional.of(openSession));

            mockMvc.perform(get("/api/v1/class-sessions/5"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.classSessionId").value(5))
                    .andExpect(jsonPath("$.scheduleBlockId").value(100))
                    .andExpect(jsonPath("$.sessionDate").value("2026-03-02"))
                    .andExpect(jsonPath("$.sessionStatus").value("Open"));
        }

        @Test
        @DisplayName("givenMissingId_whenGetClassSession_thenReturn404WithErrorMessage")
        void givenMissingId_whenGetClassSession_thenReturn404WithErrorMessage() throws Exception {
            mockMvc.perform(get("/api/v1/class-sessions/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("ClassSession not found with identifier=999"));
        }

        @Test
        @DisplayName("givenSessionOfAnotherSchool_whenGet_thenReturn404AsIfItDidNotExist")
        void givenSessionOfAnotherSchool_whenGet_thenReturn404() throws Exception {
            session5InBlockTaughtBy(openSession, 41L);

            mockMvc.perform(get("/api/v1/class-sessions/5")
                            .requestAttr(AuthTokenFilter.CALLER_SCHOOL_ATTRIBUTE, new CallerSchool(false, 8, 41L)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("givenExistingId_whenUpdateClassSession_thenReturn200")
        void givenExistingId_whenUpdateClassSession_thenReturn200() throws Exception {
            // The status moves only via /open|close|cancel since AUD-67: PUT edits the date.
            when(sessions.findById(5L)).thenReturn(Optional.of(openSession));

            mockMvc.perform(put("/api/v1/class-sessions/5")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"sessionDate":"2026-03-09"}"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.sessionDate").value("2026-03-09"));
        }

        @Test
        @DisplayName("givenExistingId_whenDeleteClassSession_thenReturn204")
        void givenExistingId_whenDeleteClassSession_thenReturn204() throws Exception {
            when(sessions.findById(5L)).thenReturn(Optional.of(openSession));

            mockMvc.perform(delete("/api/v1/class-sessions/5"))
                    .andExpect(status().isNoContent());

            verify(sessions).deleteById(5L);
        }

        @Test
        @DisplayName("givenSessionsFilteredByBlock_whenList_thenReturnSliceWithTotalCount")
        void givenSessionsFilteredByBlock_whenList_thenReturnSliceWithTotalCount() throws Exception {
            when(sessions.search(new ClassSessionFilter(100L, null, null, null), null)).thenReturn(List.of(openSession));

            mockMvc.perform(get("/api/v1/class-sessions")
                            .param("scheduleBlockId", "100")
                            .param("limit", "10"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("X-Total-Count", "1"))
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].scheduleBlockId").value(100));
        }
    }

    @Nested
    @DisplayName("POST /api/v1/class-sessions/{id}/open|close|cancel")
    class LifecycleTests {

        @BeforeEach
        void blockTaughtBy41() {
            session5InBlockTaughtBy(openSession, 41L);
        }

        @Test
        @DisplayName("givenAdministratorWithOwnActorWhoIsNotTheInstructor_whenOpenCloseOrCancel_thenReturn403")
        void givenAdministratorWithOwnActor_whenClose_thenReturn403() throws Exception {
            for (String verb : List.of("open", "close", "cancel")) {
                mockMvc.perform(as(post("/api/v1/class-sessions/5/" + verb), 99L, "Administrador"))
                        .andExpect(status().isForbidden());
            }
            verify(sessions, never()).save(any());
        }

        @Test
        @DisplayName("givenSuperAdministrator_whenClose_thenReturn403")
        void givenSuperAdministrator_whenClose_thenReturn403() throws Exception {
            mockMvc.perform(post("/api/v1/class-sessions/5/close")
                            .requestAttr(AuthTokenFilter.CALLER_SCHOOL_ATTRIBUTE, new CallerSchool(true, null, 99L))
                            .requestAttr("X-User-Roles", List.of("Super Administrador")))
                    .andExpect(status().isForbidden());
            verify(sessions, never()).save(any());
        }

        @Test
        @DisplayName("givenCallerWithoutResolvedActor_whenClose_thenReturn403")
        void givenCallerWithoutResolvedActor_whenClose_thenReturn403() throws Exception {
            mockMvc.perform(post("/api/v1/class-sessions/5/close")).andExpect(status().isForbidden());
            verify(sessions, never()).save(any());
        }

        @Test
        @DisplayName("givenAnotherInstructorsClass_whenOpenCloseOrCancel_thenReturn403AndNothingChanges")
        void givenAnotherInstructorsClass_whenOpenCloseOrCancel_thenReturn403() throws Exception {
            for (String verb : List.of("open", "close", "cancel")) {
                mockMvc.perform(as(post("/api/v1/class-sessions/5/" + verb), 42L, "Instructor"))
                        .andExpect(status().isForbidden());
            }
            verify(sessions, never()).save(any());
        }

        @Test
        @DisplayName("givenSessionWithoutStatus_whenItsInstructorOpens_thenReturn200StampedWithTheCallersActor")
        void givenSessionWithoutStatus_whenOpen_thenReturn200() throws Exception {
            // Every stored session is Open, Closed or Cancelled, so /open only repairs a row without status.
            session5InBlockTaughtBy(withStatus(openSession, null), 41L);

            // A body, even with an openedBy, is ignored: opened_by is the caller's own actor.
            mockMvc.perform(as(post("/api/v1/class-sessions/5/open"), 41L, "Instructor")
                            .content("""
                                    {"openedBy":77}"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.sessionStatus").value("Open"))
                    .andExpect(jsonPath("$.openedBy").value(41));
        }

        @Test
        @DisplayName("givenAlreadyOpenSession_whenOpen_thenReturn400WithExactMessage")
        void givenAlreadyOpenSession_whenOpen_thenReturn400WithExactMessage() throws Exception {
            mockMvc.perform(as(post("/api/v1/class-sessions/5/open"), 41L, "Instructor"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("ClassSession already Open"));
        }

        @Test
        @DisplayName("givenMissingSession_whenOpen_thenReturn404")
        void givenMissingSession_whenOpen_thenReturn404() throws Exception {
            mockMvc.perform(as(post("/api/v1/class-sessions/999/open"), 41L, "Instructor"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("ClassSession not found with identifier=999"));
        }

        @Test
        @DisplayName("givenOpenSession_whenClose_thenReturn200ClosedByTheCallersActorNeverTheClients")
        void givenOpenSession_whenClose_thenReturn200Closed() throws Exception {
            mockMvc.perform(as(post("/api/v1/class-sessions/5/close"), 41L, "Instructor")
                            .content("""
                                    {"closedBy":88}"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.sessionStatus").value("Closed"))
                    .andExpect(jsonPath("$.closedBy").value(41));

            verify(eventPublisher).publish(eq(CloseClassSessionUseCaseImpl.CLOSED_TOPIC), anyString());
        }

        @Test
        @DisplayName("givenCancelledSession_whenClose_thenReturn400WithExactMessage")
        void givenCancelledSession_whenClose_thenReturn400WithExactMessage() throws Exception {
            session5InBlockTaughtBy(withStatus(openSession, "Cancelled"), 41L);

            mockMvc.perform(as(post("/api/v1/class-sessions/5/close"), 41L, "Instructor"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Cannot close a Cancelled session"));
        }

        @Test
        @DisplayName("givenOpenSession_whenCancel_thenReturn200Cancelled")
        void givenOpenSession_whenCancel_thenReturn200Cancelled() throws Exception {
            mockMvc.perform(as(post("/api/v1/class-sessions/5/cancel"), 41L, "Instructor"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.sessionStatus").value("Cancelled"));
        }

        @Test
        @DisplayName("givenClosedSession_whenCancel_thenReturn400WithExactMessage")
        void givenClosedSession_whenCancel_thenReturn400WithExactMessage() throws Exception {
            session5InBlockTaughtBy(withStatus(openSession, "Closed"), 41L);

            mockMvc.perform(as(post("/api/v1/class-sessions/5/cancel"), 41L, "Instructor"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Cannot cancel a Closed session"));
        }

        @Test
        @DisplayName("givenMissingSession_whenCancel_thenReturn404")
        void givenMissingSession_whenCancel_thenReturn404() throws Exception {
            mockMvc.perform(as(post("/api/v1/class-sessions/999/cancel"), 41L, "Instructor"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("ClassSession not found with identifier=999"));
        }
    }

    /** AUD-67: create/update/delete obey the same ownership rule as open/close/cancel. */
    @Nested
    @DisplayName("POST/PUT/DELETE /api/v1/class-sessions ownership and server-stamped actor (AUD-67)")
    class OwnershipTests {

        @Test
        @DisplayName("givenAnotherInstructorsSession_whenPut_thenReturn403AndNothingChanges")
        void givenAnotherInstructorsSession_whenPut_thenReturn403() throws Exception {
            session5InBlockTaughtBy(openSession, 41L);

            mockMvc.perform(as(put("/api/v1/class-sessions/5"), 42L, "Instructor")
                            .content("{\"sessionDate\":\"2026-03-09\"}"))
                    .andExpect(status().isForbidden());

            verify(sessions, never()).save(any());
        }

        @Test
        @DisplayName("givenAnotherInstructorsSession_whenDelete_thenReturn403AndNothingChanges")
        void givenAnotherInstructorsSession_whenDelete_thenReturn403() throws Exception {
            session5InBlockTaughtBy(openSession, 41L);

            mockMvc.perform(as(delete("/api/v1/class-sessions/5"), 42L, "Instructor"))
                    .andExpect(status().isForbidden());

            verify(sessions, never()).deleteById(any());
        }

        @Test
        @DisplayName("givenOwnSessionOrSchoolAdmin_whenPutDate_thenReturn200")
        void givenOwnSessionOrSchoolAdmin_whenPutDate_thenReturn200() throws Exception {
            session5InBlockTaughtBy(openSession, 41L);

            mockMvc.perform(as(put("/api/v1/class-sessions/5"), 41L, "Instructor")
                    .content("{\"sessionDate\":\"2026-03-09\"}")).andExpect(status().isOk());
            mockMvc.perform(as(put("/api/v1/class-sessions/5"), 99L, "Administrador")
                    .content("{\"sessionDate\":\"2026-03-09\"}")).andExpect(status().isOk());
        }

        @Test
        @DisplayName("givenStatusChangeInPut_whenPut_thenReturn400BecauseLifecycleHasItsOwnEndpoints")
        void givenStatusChangeInPut_whenPut_thenReturn400() throws Exception {
            session5InBlockTaughtBy(openSession, 41L);

            mockMvc.perform(as(put("/api/v1/class-sessions/5"), 41L, "Instructor")
                            .content("{\"sessionStatus\":\"Closed\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("sessionStatus cannot be changed with PUT; use /open, /close or /cancel"));

            verify(sessions, never()).save(any());
        }

        @Test
        @DisplayName("givenMovingSessionToAnotherInstructorsBlock_whenPut_thenReturn403")
        void givenMovingSessionToAnotherInstructorsBlock_whenPut_thenReturn403() throws Exception {
            session5InBlockTaughtBy(openSession, 42L);
            when(blocks.findById(200L)).thenReturn(Optional.of(block(200L, 41L)));

            mockMvc.perform(as(put("/api/v1/class-sessions/5"), 42L, "Instructor")
                            .content("{\"scheduleBlockId\":200}"))
                    .andExpect(status().isForbidden());

            verify(sessions, never()).save(any());
        }

        @Test
        @DisplayName("givenAnotherInstructorsBlock_whenCreate_thenReturn403")
        void givenAnotherInstructorsBlock_whenCreate_thenReturn403() throws Exception {
            session5InBlockTaughtBy(openSession, 41L);

            mockMvc.perform(as(post("/api/v1/class-sessions"), 42L, "Instructor")
                            .content("{\"scheduleBlockId\":100,\"sessionDate\":\"2026-03-02\"}"))
                    .andExpect(status().isForbidden());

            verify(sessions, never()).save(any());
        }

        @Test
        @DisplayName("givenClientSuppliedOpenedBy_whenCreate_thenServerStampsCallersOwnActor")
        void givenClientSuppliedOpenedBy_whenCreate_thenServerStampsCallersOwnActor() throws Exception {
            session5InBlockTaughtBy(openSession, 41L);

            mockMvc.perform(as(post("/api/v1/class-sessions"), 41L, "Instructor")
                            .content("{\"scheduleBlockId\":100,\"sessionDate\":\"2026-03-02\",\"openedBy\":777}"))
                    .andExpect(status().isCreated());

            ArgumentCaptor<ClassSession> captor = ArgumentCaptor.forClass(ClassSession.class);
            verify(sessions).save(captor.capture());
            assertEquals(41L, captor.getValue().getOpenedBy());
            assertNotNull(captor.getValue().getOpenedAt());
        }

        @Test
        @DisplayName("givenCallerWithoutActor_whenCreateWithClientOpenedBy_thenOpenedByIsDiscarded")
        void givenCallerWithoutActor_whenCreateWithClientOpenedBy_thenOpenedByIsDiscarded() throws Exception {
            mockMvc.perform(post("/api/v1/class-sessions").contentType(MediaType.APPLICATION_JSON)
                            .content("{\"scheduleBlockId\":100,\"sessionDate\":\"2026-03-02\",\"openedBy\":777}"))
                    .andExpect(status().isCreated());

            ArgumentCaptor<ClassSession> captor = ArgumentCaptor.forClass(ClassSession.class);
            verify(sessions).save(captor.capture());
            assertNull(captor.getValue().getOpenedBy());
            assertNull(captor.getValue().getOpenedAt());
        }

        @Test
        @DisplayName("givenNonOpenStatus_whenCreate_thenReturn400SoNoClosedSessionIsBornWithoutClosedBy")
        void givenNonOpenStatus_whenCreate_thenReturn400() throws Exception {
            mockMvc.perform(post("/api/v1/class-sessions").contentType(MediaType.APPLICATION_JSON)
                            .content("{\"scheduleBlockId\":100,\"sessionDate\":\"2026-03-02\",\"sessionStatus\":\"Closed\"}"))
                    .andExpect(status().isBadRequest());

            verify(sessions, never()).save(any());
        }

        @Test
        @DisplayName("givenSchoolScopedCaller_whenListByBlockAndQueryIsUnscoped_thenTheSchoolIsNeverDropped")
        void givenSuperAdministrator_whenList_thenUnscopedQuery() throws Exception {
            mockMvc.perform(get("/api/v1/class-sessions")
                            .requestAttr(AuthTokenFilter.CALLER_SCHOOL_ATTRIBUTE, new CallerSchool(true, null, null)))
                    .andExpect(status().isOk());
            verify(sessions).search(eq(ClassSessionFilter.NONE), isNull());
        }
    }
}
