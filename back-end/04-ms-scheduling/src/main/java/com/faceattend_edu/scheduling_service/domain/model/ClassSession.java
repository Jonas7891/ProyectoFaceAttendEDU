package com.faceattend_edu.scheduling_service.domain.model;

import com.faceattend_edu.scheduling_service.domain.exception.ValidationException;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClassSession {
    private Long classSessionId;
    private Long scheduleBlockId;
    private LocalDate sessionDate;
    private String sessionStatus;
    private Long openedBy;
    private Instant openedAt;
    private Long closedBy;
    private Instant closedAt;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;
    private UUID createdBy;
    private UUID updatedBy;
    private UUID deletedBy;
    private long rowVersion;

    public void validate() {
        if (scheduleBlockId == null) throw new IllegalArgumentException("scheduleBlockId is required");
        if (sessionDate == null) throw new IllegalArgumentException("sessionDate is required");
        if (sessionStatus == null || sessionStatus.isBlank()) throw new IllegalArgumentException("sessionStatus is required");
        if (ClassSessionStatus.of(sessionStatus).isEmpty()) throw new IllegalArgumentException("sessionStatus must be one of " + ClassSessionStatus.labels());
    }

    public void touchCreated() {
        if (createdAt == null) createdAt = Instant.now();
        if (sessionStatus == null) sessionStatus = ClassSessionStatus.OPEN.label();
        if (rowVersion == 0) rowVersion = 1L;
    }

    public void touchUpdated() {
        updatedAt = Instant.now();
        // row_version is owned by JPA @Version (reinforced by fn_audit_timestamps trigger);
        // pre-incrementing it here makes merge() fail with StaleObjectStateException
    }

    /** The status as the domain sees it; empty only for a row that breaks the enum. */
    public Optional<ClassSessionStatus> status() { return ClassSessionStatus.of(sessionStatus); }

    public boolean isOpen() { return is(ClassSessionStatus.OPEN); }
    public boolean isClosed() { return is(ClassSessionStatus.CLOSED); }
    public boolean isCancelled() { return is(ClassSessionStatus.CANCELLED); }

    private boolean is(ClassSessionStatus expected) { return status().filter(expected::equals).isPresent(); }

    private void moveTo(ClassSessionStatus next) { sessionStatus = next.label(); }

    /** The status spelled as stored ("closed" -> "Closed"), or null when it is not a session status. */
    public static String canonicalStatus(String status) {
        if (status == null) return null;
        return ClassSessionStatus.parse(status).map(ClassSessionStatus::label).orElse(null);
    }

    /**
     * A session is born Open and its opener is whoever creates it (AUD-67): a Closed or Cancelled
     * birth would leave closed_by NULL (AUD-27). /close and /cancel are the only way to move on.
     */
    public void startOpen(Long openerActorId, Instant at) {
        if (sessionStatus == null) moveTo(ClassSessionStatus.OPEN);
        if (!isOpen()) {
            throw new ValidationException("A class session is created Open; use /close or /cancel to change its status");
        }
        openedBy = openerActorId;
        openedAt = openerActorId == null ? null : at;
    }

    /** Status moves only through open/close/cancel, which stamp the acting actor. */
    public void requireSameStatus(String requestedStatus) {
        if (requestedStatus != null && !requestedStatus.equals(sessionStatus)) {
            throw new ValidationException("sessionStatus cannot be changed with PUT; use /open, /close or /cancel");
        }
    }

    public void open(Long actorId, Instant at) {
        if (isOpen()) throw new ValidationException("ClassSession already Open");
        if (isClosed() || isCancelled()) throw new ValidationException("Cannot open a session that is " + sessionStatus);
        moveTo(ClassSessionStatus.OPEN);
        openedBy = actorId;
        openedAt = at;
        touchUpdated();
    }

    /** AGENTS.md 6.8: closing records closed_by/closed_at, never anonymously (AUD-27). */
    public void close(Long actorId, Instant at) {
        if (isClosed()) throw new ValidationException("ClassSession already Closed");
        if (isCancelled()) throw new ValidationException("Cannot close a Cancelled session");
        if (actorId == null) {
            throw new ValidationException("Cannot close the session: the caller has no academic actor to record in closed_by");
        }
        moveTo(ClassSessionStatus.CLOSED);
        closedBy = actorId;
        closedAt = at;
        touchUpdated();
    }

    public void cancel() {
        if (isCancelled()) throw new ValidationException("ClassSession already Cancelled");
        if (isClosed()) throw new ValidationException("Cannot cancel a Closed session");
        moveTo(ClassSessionStatus.CANCELLED);
        touchUpdated();
    }

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ClassSession)) return false;
        ClassSession that = (ClassSession) o;
        return Objects.equals(classSessionId, that.classSessionId);
    }
    @Override public int hashCode() { return Objects.hash(classSessionId); }
}
