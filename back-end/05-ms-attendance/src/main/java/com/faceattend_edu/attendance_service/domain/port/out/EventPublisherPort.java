package com.faceattend_edu.attendance_service.domain.port.out;

/** Outbound port for integration events; the adapter decides how and when they leave. */
public interface EventPublisherPort {

    /** Publishes once the current transaction commits, or at once without a transaction. */
    void publish(String topic, String payload);

    /** Same as {@link #publish(String, String)}, with a record key so one entity keeps its order. */
    void publishAfterCommit(String topic, String key, String payload);
}
