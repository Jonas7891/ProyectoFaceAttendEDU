package com.faceattend_edu.scheduling_service.domain.model;

import java.util.Arrays;
import java.util.Optional;

/**
 * The PostgreSQL enum {@code class_session_status} (AGENTS.md section 2.5). {@link #label()} is the
 * text stored and sent over the API; the domain decides with the constants, never with strings.
 */
public enum ClassSessionStatus {
    OPEN("Open"),
    CLOSED("Closed"),
    CANCELLED("Cancelled");

    private final String label;

    ClassSessionStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    /** The status with exactly this stored label. */
    public static Optional<ClassSessionStatus> of(String label) {
        return Arrays.stream(values()).filter(s -> s.label.equals(label)).findFirst();
    }

    /** The status whatever its case ("closed" -> CLOSED), for query filters. */
    public static Optional<ClassSessionStatus> parse(String text) {
        return Arrays.stream(values()).filter(s -> s.label.equalsIgnoreCase(text)).findFirst();
    }

    /** The stored labels, for error messages. */
    public static String labels() {
        return Arrays.stream(values()).map(ClassSessionStatus::label).toList().toString();
    }
}
