package com.faceattend_edu.scheduling_service.domain.port.out;

/**
 * Outbound port for integration events. Use cases depend on this, not on Kafka: the adapter
 * decides how and when the event leaves the service.
 */
public interface EventPublisherPort {

    /**
     * Publishes {@code payload} on {@code topic} once the current transaction commits, so a
     * rolled-back change never announces an event that did not happen. Without a transaction
     * it publishes at once.
     */
    void publish(String topic, String payload);
}
