package com.faceattend_edu.scheduling_service.infrastructure.web.controller;

import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.exception.ValidationException;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.port.in.CancelClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.in.CloseClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.in.CreateClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.in.DeleteClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.in.GetClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.in.GetEnvironmentUseCase;
import com.faceattend_edu.scheduling_service.domain.port.in.GetScheduleBlockUseCase;
import com.faceattend_edu.scheduling_service.domain.port.in.ListClassSessionsUseCase;
import com.faceattend_edu.scheduling_service.domain.port.in.OpenClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.in.UpdateClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.model.Environment;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
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

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
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
 * Cobertura HTTP (MockMvc) de {@code ClassSessionController}.
 *
 * <p>Ademas del CRUD, cubre el ciclo de vida Open/Closed/Cancelled
 * ({@code POST /{id}/open|close|cancel}): transiciones validas, transiciones
 * invalidas (mensajes EXACTOS de los use cases: {@code "ClassSession already Open"},
 * {@code "Cannot close a Cancelled session"}, {@code "Cannot cancel a Closed session"})
 * y sesion inexistente. El {@code ClassSessionWebMapper} se importa real para
 * comprobar que {@code sessionStatus} nulo mapea a {@code "Open"} por defecto.</p>
 */
@WebMvcTest(controllers = ClassSessionController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ClassSessionWebMapper.class)
@DisplayName("IEEE 829 TC-04-002: ClassSessionController HTTP tests (MockMvc)")
class ClassSessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateClassSessionUseCase createUseCase;
    @MockitoBean
    private UpdateClassSessionUseCase updateUseCase;
    @MockitoBean
    private GetClassSessionUseCase getUseCase;
    @MockitoBean
    private ListClassSessionsUseCase listUseCase;
    @MockitoBean
    private DeleteClassSessionUseCase deleteUseCase;
    @MockitoBean
    private OpenClassSessionUseCase openUseCase;
    @MockitoBean
    private CloseClassSessionUseCase closeUseCase;
    @MockitoBean
    private CancelClassSessionUseCase cancelUseCase;
    @MockitoBean
    private GetScheduleBlockUseCase getScheduleBlockUseCase;
    @MockitoBean
    private GetEnvironmentUseCase getEnvironmentUseCase;

    private ClassSession openSession;

    @BeforeEach
    void setUp() {
        openSession = new ClassSession();
        openSession.setClassSessionId(5L);
        openSession.setScheduleBlockId(100L);
        openSession.setSessionDate(LocalDate.of(2026, 3, 2));
        openSession.setSessionStatus("Open");
        openSession.setRowVersion(1L);
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

    @Nested
    @DisplayName("GET /api/v1/class-sessions filters")
    class ListFilterTests {

        @Test
        @DisplayName("givenDateRangeAndStatus_whenList_thenOnlyClosedSessionsInsideTheRangeAreReturned")
        void givenDateRangeAndStatus_whenList_thenOnlyClosedSessionsInsideTheRangeAreReturned() throws Exception {
            ClassSession before = withStatus(openSession, "Closed");
            before.setClassSessionId(1L);
            before.setSessionDate(LocalDate.of(2026, 3, 1));
            ClassSession inside = withStatus(openSession, "Closed");
            inside.setClassSessionId(2L);
            inside.setSessionDate(LocalDate.of(2026, 3, 3));
            ClassSession insideOpen = withStatus(openSession, "Open");
            insideOpen.setClassSessionId(3L);
            insideOpen.setSessionDate(LocalDate.of(2026, 3, 3));
            ClassSession after = withStatus(openSession, "Closed");
            after.setClassSessionId(4L);
            after.setSessionDate(LocalDate.of(2026, 3, 9));
            when(listUseCase.list()).thenReturn(List.of(before, inside, insideOpen, after));

            mockMvc.perform(get("/api/v1/class-sessions")
                            .param("from", "2026-03-02")
                            .param("to", "2026-03-08")
                            .param("sessionStatus", "Closed"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].classSessionId").value(2));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/class-sessions with an orphan session (AUD-35)")
    class OrphanSessionListTests {

        @Test
        @DisplayName("givenSessionWhoseBlockIsSoftDeleted_whenSchoolScopedCallerLists_thenOkAndOrphanIsOmitted")
        void givenSessionWhoseBlockIsSoftDeleted_whenSchoolScopedCallerLists_thenOkAndOrphanIsOmitted() throws Exception {
            ClassSession healthy = withStatus(openSession, "Open");
            healthy.setClassSessionId(1L);
            healthy.setScheduleBlockId(100L);
            ClassSession orphan = withStatus(openSession, "Open");
            orphan.setClassSessionId(2L);
            orphan.setScheduleBlockId(291L);
            when(listUseCase.list()).thenReturn(List.of(orphan, healthy));

            ScheduleBlock block = new ScheduleBlock();
            block.setScheduleBlockId(100L);
            block.setEnvironmentId(10);
            Environment environment = new Environment();
            environment.setSchoolId(1);
            when(getScheduleBlockUseCase.getById(100L)).thenReturn(block);
            when(getScheduleBlockUseCase.getById(291L)).thenThrow(new EntityNotFoundException("ScheduleBlock", 291L));
            when(getEnvironmentUseCase.getById(10)).thenReturn(environment);

            mockMvc.perform(get("/api/v1/class-sessions")
                            .requestAttr(AuthTokenFilter.CALLER_SCHOOL_ATTRIBUTE, new CallerSchool(false, 1, 5L)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].classSessionId").value(1));
        }
    }

    @Nested
    @DisplayName("POST /api/v1/class-sessions")
    class CreateTests {

        @Test
        @DisplayName("givenValidRequest_whenCreateClassSession_thenReturn201WithDefaultOpenStatus")
        void givenValidRequest_whenCreateClassSession_thenReturn201WithDefaultOpenStatus() throws Exception {
            // Arrange: el mapper real (importado) debe poner sessionStatus="Open" si viene nulo
            when(createUseCase.create(any(ClassSession.class))).thenReturn(openSession);

            // Act & Assert
            mockMvc.perform(post("/api/v1/class-sessions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"scheduleBlockId":100,"sessionDate":"2026-03-02"}"""))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.classSessionId").value(5))
                    .andExpect(jsonPath("$.scheduleBlockId").value(100))
                    .andExpect(jsonPath("$.sessionDate").value("2026-03-02"))
                    .andExpect(jsonPath("$.sessionStatus").value("Open"));

            // El default "Open" vive en el mapper: se captura el dominio recibido por el use case
            ArgumentCaptor<ClassSession> captor = ArgumentCaptor.forClass(ClassSession.class);
            verify(createUseCase).create(captor.capture());
            assertEquals("Open", captor.getValue().getSessionStatus());
            assertEquals(LocalDate.of(2026, 3, 2), captor.getValue().getSessionDate());
        }

        @Test
        @DisplayName("givenMissingSessionDate_whenCreateClassSession_thenReturn400FieldError")
        void givenMissingSessionDate_whenCreateClassSession_thenReturn400FieldError() throws Exception {
            // Arrange: CreateClassSessionRequest.sessionDate es @NotNull

            // Act & Assert
            mockMvc.perform(post("/api/v1/class-sessions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"scheduleBlockId":100}"""))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("sessionDate: must not be null"));

            verify(createUseCase, never()).create(any(ClassSession.class));
        }
    }

    @Nested
    @DisplayName("GET/PUT/DELETE /api/v1/class-sessions")
    class CrudTests {

        @Test
        @DisplayName("givenExistingId_whenGetClassSession_thenReturn200Json")
        void givenExistingId_whenGetClassSession_thenReturn200Json() throws Exception {
            // Arrange
            when(getUseCase.getById(5L)).thenReturn(openSession);

            // Act & Assert
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
            // Arrange
            when(getUseCase.getById(999L)).thenThrow(new EntityNotFoundException("ClassSession", 999L));

            // Act & Assert
            mockMvc.perform(get("/api/v1/class-sessions/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("ClassSession not found with identifier=999"));
        }

        @Test
        @DisplayName("givenExistingId_whenUpdateClassSession_thenReturn200")
        void givenExistingId_whenUpdateClassSession_thenReturn200() throws Exception {
            // Arrange
            // (the status moves only via /open|close|cancel since AUD-67: PUT edits the date)
            ClassSession moved = withStatus(openSession, "Open");
            moved.setSessionDate(LocalDate.of(2026, 3, 9));
            when(getUseCase.getById(5L)).thenReturn(openSession);
            when(updateUseCase.update(org.mockito.ArgumentMatchers.eq(5L), any(ClassSession.class)))
                    .thenReturn(moved);

            // Act & Assert
            mockMvc.perform(put("/api/v1/class-sessions/5")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"sessionDate":"2026-03-09"}"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.sessionDate").value("2026-03-09"));

            verify(updateUseCase).update(org.mockito.ArgumentMatchers.eq(5L), any(ClassSession.class));
        }

        @Test
        @DisplayName("givenExistingId_whenDeleteClassSession_thenReturn204")
        void givenExistingId_whenDeleteClassSession_thenReturn204() throws Exception {
            // Act & Assert
            mockMvc.perform(delete("/api/v1/class-sessions/5"))
                    .andExpect(status().isNoContent());

            verify(deleteUseCase).delete(5L);
        }

        @Test
        @DisplayName("givenSessionsFilteredByBlock_whenList_thenReturnSliceWithTotalCount")
        void givenSessionsFilteredByBlock_whenList_thenReturnSliceWithTotalCount() throws Exception {
            // Arrange: el filtro scheduleBlockId y el recorte limit/offset viven en el controller/Paging
            ClassSession other = new ClassSession();
            other.setClassSessionId(6L);
            other.setScheduleBlockId(200L);
            other.setSessionDate(LocalDate.of(2026, 3, 3));
            other.setSessionStatus("Open");
            other.setRowVersion(1L);
            when(listUseCase.list()).thenReturn(List.of(openSession, other));

            // Act & Assert
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

        /** A caller of school 7 whose own actor is `actorId` (as AuthTokenFilter would resolve it). */
        private void blockOfSchool7TaughtBy(long instructorActorId) {
            com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock block =
                    new com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock();
            block.setScheduleBlockId(100L);
            block.setEnvironmentId(3);
            block.setInstructorActorId(instructorActorId);
            com.faceattend_edu.scheduling_service.domain.model.Environment environment =
                    new com.faceattend_edu.scheduling_service.domain.model.Environment();
            environment.setSchoolId(7);
            when(getUseCase.getById(5L)).thenReturn(openSession);
            when(getScheduleBlockUseCase.getById(100L)).thenReturn(block);
            when(getEnvironmentUseCase.getById(3)).thenReturn(environment);
        }

        private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder asCaller(
                String verb, long ownActorId, String role) {
            return post("/api/v1/class-sessions/5/" + verb)
                    .requestAttr(com.faceattend_edu.scheduling_service.infrastructure.web.security.AuthTokenFilter.CALLER_SCHOOL_ATTRIBUTE,
                            new com.faceattend_edu.scheduling_service.infrastructure.web.security.CallerSchoolResolver.CallerSchool(false, 7, ownActorId))
                    .requestAttr("X-User-Roles", List.of(role));
        }

        @Test
        @DisplayName("givenAnotherInstructorsClass_whenOpenCloseOrCancel_thenReturn403AndNothingChanges")
        void givenAnotherInstructorsClass_whenOpenCloseOrCancel_thenReturn403() throws Exception {
            blockOfSchool7TaughtBy(41L);

            for (String verb : List.of("open", "close", "cancel")) {
                mockMvc.perform(asCaller(verb, 42L, "Instructor")).andExpect(status().isForbidden());
            }
            org.mockito.Mockito.verifyNoInteractions(openUseCase, closeUseCase, cancelUseCase);
        }

        @Test
        @DisplayName("givenOwnClassOrSchoolAdmin_whenOpen_thenReturn200")
        void givenOwnClassOrSchoolAdmin_whenOpen_thenReturn200() throws Exception {
            blockOfSchool7TaughtBy(41L);
            when(openUseCase.open(org.mockito.ArgumentMatchers.eq(5L), org.mockito.ArgumentMatchers.any())).thenReturn(openSession);

            mockMvc.perform(asCaller("open", 41L, "Instructor")).andExpect(status().isOk());
            mockMvc.perform(asCaller("open", 99L, "Administrador")).andExpect(status().isOk());
        }

        @Test
        @DisplayName("givenOpenableSession_whenOpen_thenReturn200Open")
        void givenOpenableSession_whenOpen_thenReturn200Open() throws Exception {
            // Arrange: openedBy is no longer read from the request body (it was
            // spoofable) — the controller derives it from the caller's own actor,
            // which is null outside the real AuthTokenFilter (addFilters=false here).
            when(openUseCase.open(5L, null)).thenReturn(openSession);

            // Act & Assert: a body, even with an openedBy, is ignored.
            mockMvc.perform(post("/api/v1/class-sessions/5/open")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"openedBy":77}"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.sessionStatus").value("Open"));

            verify(openUseCase).open(5L, null);
        }

        @Test
        @DisplayName("givenAlreadyOpenSession_whenOpen_thenReturn400WithExactMessage")
        void givenAlreadyOpenSession_whenOpen_thenReturn400WithExactMessage() throws Exception {
            // Arrange: mensaje EXACTO de OpenClassSessionUseCaseImpl
            when(openUseCase.open(5L, null))
                    .thenThrow(new ValidationException("ClassSession already Open"));

            // Act & Assert: sin body -> openedBy null
            mockMvc.perform(post("/api/v1/class-sessions/5/open"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("ClassSession already Open"));
        }

        @Test
        @DisplayName("givenMissingSession_whenOpen_thenReturn404")
        void givenMissingSession_whenOpen_thenReturn404() throws Exception {
            // Arrange
            when(openUseCase.open(999L, null))
                    .thenThrow(new EntityNotFoundException("ClassSession", 999L));

            // Act & Assert
            mockMvc.perform(post("/api/v1/class-sessions/999/open"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("ClassSession not found with identifier=999"));
        }

        @Test
        @DisplayName("givenOpenSession_whenClose_thenReturn200Closed")
        void givenOpenSession_whenClose_thenReturn200Closed() throws Exception {
            // Arrange: closedBy is no longer read from the request body (it was
            // spoofable) — null here outside the real AuthTokenFilter.
            ClassSession closed = withStatus(openSession, "Closed");
            closed.setClosedBy(88L);
            when(closeUseCase.close(5L, null)).thenReturn(closed);

            // Act & Assert: a body, even with a closedBy, is ignored.
            mockMvc.perform(post("/api/v1/class-sessions/5/close")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"closedBy":88}"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.sessionStatus").value("Closed"))
                    .andExpect(jsonPath("$.closedBy").value(88));

            verify(closeUseCase).close(5L, null);
        }

        @Test
        @DisplayName("givenCancelledSession_whenClose_thenReturn400WithExactMessage")
        void givenCancelledSession_whenClose_thenReturn400WithExactMessage() throws Exception {
            // Arrange: mensaje EXACTO de CloseClassSessionUseCaseImpl
            when(closeUseCase.close(5L, null))
                    .thenThrow(new ValidationException("Cannot close a Cancelled session"));

            // Act & Assert
            mockMvc.perform(post("/api/v1/class-sessions/5/close"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Cannot close a Cancelled session"));
        }

        @Test
        @DisplayName("givenOpenSession_whenCancel_thenReturn200Cancelled")
        void givenOpenSession_whenCancel_thenReturn200Cancelled() throws Exception {
            // Arrange
            when(cancelUseCase.cancel(5L)).thenReturn(withStatus(openSession, "Cancelled"));

            // Act & Assert
            mockMvc.perform(post("/api/v1/class-sessions/5/cancel"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.sessionStatus").value("Cancelled"));

            verify(cancelUseCase).cancel(5L);
        }

        @Test
        @DisplayName("givenClosedSession_whenCancel_thenReturn400WithExactMessage")
        void givenClosedSession_whenCancel_thenReturn400WithExactMessage() throws Exception {
            // Arrange: mensaje EXACTO de CancelClassSessionUseCaseImpl
            when(cancelUseCase.cancel(5L))
                    .thenThrow(new ValidationException("Cannot cancel a Closed session"));

            // Act & Assert
            mockMvc.perform(post("/api/v1/class-sessions/5/cancel"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Cannot cancel a Closed session"));
        }

        @Test
        @DisplayName("givenMissingSession_whenCancel_thenReturn404")
        void givenMissingSession_whenCancel_thenReturn404() throws Exception {
            // Arrange
            when(cancelUseCase.cancel(999L))
                    .thenThrow(new EntityNotFoundException("ClassSession", 999L));

            // Act & Assert
            mockMvc.perform(post("/api/v1/class-sessions/999/cancel"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("ClassSession not found with identifier=999"));
        }
    }

    /** AUD-67: create/update/delete obey the same ownership rule as open/close/cancel. */
    @Nested
    @DisplayName("POST/PUT/DELETE /api/v1/class-sessions ownership and server-stamped actor (AUD-67)")
    class OwnershipTests {

        private void blockOfSchool7TaughtBy(long instructorActorId) {
            ScheduleBlock block = new ScheduleBlock();
            block.setScheduleBlockId(100L);
            block.setEnvironmentId(3);
            block.setInstructorActorId(instructorActorId);
            Environment environment = new Environment();
            environment.setSchoolId(7);
            when(getUseCase.getById(5L)).thenReturn(openSession);
            when(getScheduleBlockUseCase.getById(100L)).thenReturn(block);
            when(getEnvironmentUseCase.getById(3)).thenReturn(environment);
        }

        private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder as(
                org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request,
                long ownActorId, String role) {
            return request
                    .requestAttr(AuthTokenFilter.CALLER_SCHOOL_ATTRIBUTE, new CallerSchool(false, 7, ownActorId))
                    .requestAttr("X-User-Roles", List.of(role))
                    .contentType(MediaType.APPLICATION_JSON);
        }

        @Test
        @DisplayName("givenAnotherInstructorsSession_whenPut_thenReturn403AndNothingChanges")
        void givenAnotherInstructorsSession_whenPut_thenReturn403() throws Exception {
            blockOfSchool7TaughtBy(41L);

            mockMvc.perform(as(put("/api/v1/class-sessions/5"), 42L, "Instructor")
                            .content("{\"sessionDate\":\"2026-03-09\"}"))
                    .andExpect(status().isForbidden());

            org.mockito.Mockito.verifyNoInteractions(updateUseCase);
        }

        @Test
        @DisplayName("givenAnotherInstructorsSession_whenDelete_thenReturn403AndNothingChanges")
        void givenAnotherInstructorsSession_whenDelete_thenReturn403() throws Exception {
            blockOfSchool7TaughtBy(41L);

            mockMvc.perform(as(delete("/api/v1/class-sessions/5"), 42L, "Instructor"))
                    .andExpect(status().isForbidden());

            org.mockito.Mockito.verifyNoInteractions(deleteUseCase);
        }

        @Test
        @DisplayName("givenOwnSessionOrSchoolAdmin_whenPutDate_thenReturn200")
        void givenOwnSessionOrSchoolAdmin_whenPutDate_thenReturn200() throws Exception {
            blockOfSchool7TaughtBy(41L);
            when(updateUseCase.update(org.mockito.ArgumentMatchers.eq(5L), any(ClassSession.class))).thenReturn(openSession);

            mockMvc.perform(as(put("/api/v1/class-sessions/5"), 41L, "Instructor")
                    .content("{\"sessionDate\":\"2026-03-09\"}")).andExpect(status().isOk());
            mockMvc.perform(as(put("/api/v1/class-sessions/5"), 99L, "Administrador")
                    .content("{\"sessionDate\":\"2026-03-09\"}")).andExpect(status().isOk());
        }

        @Test
        @DisplayName("givenStatusChangeInPut_whenPut_thenReturn400BecauseLifecycleHasItsOwnEndpoints")
        void givenStatusChangeInPut_whenPut_thenReturn400() throws Exception {
            blockOfSchool7TaughtBy(41L);

            mockMvc.perform(as(put("/api/v1/class-sessions/5"), 41L, "Instructor")
                            .content("{\"sessionStatus\":\"Closed\"}"))
                    .andExpect(status().isBadRequest());

            org.mockito.Mockito.verifyNoInteractions(updateUseCase);
        }

        @Test
        @DisplayName("givenMovingSessionToAnotherInstructorsBlock_whenPut_thenReturn403")
        void givenMovingSessionToAnotherInstructorsBlock_whenPut_thenReturn403() throws Exception {
            blockOfSchool7TaughtBy(42L);
            ScheduleBlock other = new ScheduleBlock();
            other.setScheduleBlockId(200L);
            other.setEnvironmentId(3);
            other.setInstructorActorId(41L);
            when(getScheduleBlockUseCase.getById(200L)).thenReturn(other);

            mockMvc.perform(as(put("/api/v1/class-sessions/5"), 42L, "Instructor")
                            .content("{\"scheduleBlockId\":200}"))
                    .andExpect(status().isForbidden());

            org.mockito.Mockito.verifyNoInteractions(updateUseCase);
        }

        @Test
        @DisplayName("givenAnotherInstructorsBlock_whenCreate_thenReturn403")
        void givenAnotherInstructorsBlock_whenCreate_thenReturn403() throws Exception {
            blockOfSchool7TaughtBy(41L);

            mockMvc.perform(as(post("/api/v1/class-sessions"), 42L, "Instructor")
                            .content("{\"scheduleBlockId\":100,\"sessionDate\":\"2026-03-02\"}"))
                    .andExpect(status().isForbidden());

            org.mockito.Mockito.verifyNoInteractions(createUseCase);
        }

        @Test
        @DisplayName("givenClientSuppliedOpenedBy_whenCreate_thenServerStampsCallersOwnActor")
        void givenClientSuppliedOpenedBy_whenCreate_thenServerStampsCallersOwnActor() throws Exception {
            blockOfSchool7TaughtBy(41L);
            when(createUseCase.create(any(ClassSession.class))).thenReturn(openSession);

            mockMvc.perform(as(post("/api/v1/class-sessions"), 41L, "Instructor")
                            .content("{\"scheduleBlockId\":100,\"sessionDate\":\"2026-03-02\",\"openedBy\":777}"))
                    .andExpect(status().isCreated());

            ArgumentCaptor<ClassSession> captor = ArgumentCaptor.forClass(ClassSession.class);
            verify(createUseCase).create(captor.capture());
            assertEquals(41L, captor.getValue().getOpenedBy());
            org.junit.jupiter.api.Assertions.assertNotNull(captor.getValue().getOpenedAt());
        }

        @Test
        @DisplayName("givenCallerWithoutActor_whenCreateWithClientOpenedBy_thenOpenedByIsDiscarded")
        void givenCallerWithoutActor_whenCreateWithClientOpenedBy_thenOpenedByIsDiscarded() throws Exception {
            when(createUseCase.create(any(ClassSession.class))).thenReturn(openSession);

            mockMvc.perform(post("/api/v1/class-sessions").contentType(MediaType.APPLICATION_JSON)
                            .content("{\"scheduleBlockId\":100,\"sessionDate\":\"2026-03-02\",\"openedBy\":777}"))
                    .andExpect(status().isCreated());

            ArgumentCaptor<ClassSession> captor = ArgumentCaptor.forClass(ClassSession.class);
            verify(createUseCase).create(captor.capture());
            org.junit.jupiter.api.Assertions.assertNull(captor.getValue().getOpenedBy());
            org.junit.jupiter.api.Assertions.assertNull(captor.getValue().getOpenedAt());
        }

        @Test
        @DisplayName("givenNonOpenStatus_whenCreate_thenReturn400SoNoClosedSessionIsBornWithoutClosedBy")
        void givenNonOpenStatus_whenCreate_thenReturn400() throws Exception {
            mockMvc.perform(post("/api/v1/class-sessions").contentType(MediaType.APPLICATION_JSON)
                            .content("{\"scheduleBlockId\":100,\"sessionDate\":\"2026-03-02\",\"sessionStatus\":\"Closed\"}"))
                    .andExpect(status().isBadRequest());

            org.mockito.Mockito.verifyNoInteractions(createUseCase);
        }

        @Test
        @DisplayName("givenOwnClass_whenClose_thenClosedByIsTheCallersActorNeverTheClients")
        void givenOwnClass_whenClose_thenClosedByIsTheCallersActor() throws Exception {
            blockOfSchool7TaughtBy(41L);
            when(closeUseCase.close(5L, 41L)).thenReturn(withStatus(openSession, "Closed"));

            mockMvc.perform(as(post("/api/v1/class-sessions/5/close"), 41L, "Instructor").content("{\"closedBy\":9}"))
                    .andExpect(status().isOk());

            verify(closeUseCase).close(5L, 41L);
        }
    }
}
