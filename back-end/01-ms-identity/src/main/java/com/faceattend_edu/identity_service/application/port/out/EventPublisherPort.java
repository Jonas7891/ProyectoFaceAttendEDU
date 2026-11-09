package com.faceattend_edu.identity_service.application.port.out;

/**
 * Outbound port for integration events. Use cases depend on this, not on Kafka: the adapter
 * decides how the event leaves the service.
 */
public interface EventPublisherPort {

    /**
     * Publishes at once. For facts that hold even when the surrounding transaction rolls back,
     * such as an account locked by failed logins (the lock lives outside the database).
     */
    void publish(String topic, String payload);

    /**
     * Publishes once the current transaction commits, so a rolled-back change never announces
     * an event that did not happen. Without a transaction it publishes at once.
     */
    void publishAfterCommit(String topic, String payload);
}
