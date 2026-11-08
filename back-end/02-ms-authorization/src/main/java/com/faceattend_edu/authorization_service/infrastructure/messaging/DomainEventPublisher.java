package com.faceattend_edu.authorization_service.infrastructure.messaging;

import com.faceattend_edu.authorization_service.domain.port.out.EventPublisherPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Kafka adapter of {@link EventPublisherPort}. Events go out after commit; there is no outbox
 * yet, so an event is lost when Kafka is down, but the failure is now logged whether it happens
 * while sending or later, when the broker answers.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DomainEventPublisher implements EventPublisherPort {

    private final KafkaTemplate<String, String> kafkaTemplate;

    @Override
    public void publish(String topic, String payload) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            send(topic, payload);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                send(topic, payload);
            }
        });
    }

    private void send(String topic, String payload) {
        try {
            kafkaTemplate.send(topic, payload).whenComplete((result, ex) -> {
                if (ex != null) log.warn("Kafka delivery failed topic={} error={}", topic, ex.getMessage());
            });
        } catch (Exception ex) {
            log.warn("Kafka publish failed topic={} error={}", topic, ex.getMessage());
        }
    }
}
