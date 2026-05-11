package com.bank.event.consumer;

import com.bank.event.TransactionEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes transaction events from Kafka and sends notifications.
 * In production, this would integrate with an email/SMS gateway.
 */
@Component
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    @KafkaListener(topics = "transaction-events", groupId = "notification-group")
    public void onTransactionEvent(TransactionEvent event) {
        log.info("[NOTIFICATION] Processing {} event — from={}, to={}, amount={}, requestId={}",
                event.getEventType(),
                event.getFromAccount(),
                event.getToAccount(),
                event.getAmount(),
                event.getRequestId());

        // In production: send email receipt, push notification, SMS alert
        switch (event.getEventType()) {
            case "TRANSFER":
                log.info("[NOTIFICATION] Transfer receipt: {} → {} for {}",
                        event.getFromAccount(), event.getToAccount(), event.getAmount());
                break;
            case "DEPOSIT":
                log.info("[NOTIFICATION] Deposit confirmation: {} received {}",
                        event.getToAccount(), event.getAmount());
                break;
            case "WITHDRAWAL":
                log.info("[NOTIFICATION] Withdrawal alert: {} withdrew {}",
                        event.getFromAccount(), event.getAmount());
                break;
            default:
                log.warn("[NOTIFICATION] Unknown event type: {}", event.getEventType());
        }
    }
}
