package com.faceattend_edu.attendance_service.domain.model;

import java.util.Arrays;
import java.util.Optional;

/**
 * The PostgreSQL enum {@code review_status} (AGENTS.md section 2.5). {@link #label()} is the text
 * stored and sent over the API; the domain decides with the constants, never with strings.
 */
public enum ReviewStatus {
    APPROVED("Approved"),
    REJECTED("Rejected"),
    PENDING("Pending");

    private final String label;

    ReviewStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    /** The status with exactly this stored label. */
    public static Optional<ReviewStatus> of(String label) {
        return Arrays.stream(values()).filter(s -> s.label.equals(label)).findFirst();
    }

    /** The stored labels, for error messages ("[Approved, Rejected, Pending]"). */
    public static String labels() {
        return Arrays.stream(values()).map(ReviewStatus::label).toList().toString();
    }
}
