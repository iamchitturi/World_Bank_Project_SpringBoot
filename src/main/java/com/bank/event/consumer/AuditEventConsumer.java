package com.bank.event.consumer;

import com.bank.entity.AuditLog;
import com.bank.event.AccountEvent;
import com.bank.event.TransactionEvent;
import com.bank.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Asynchronous audit consumer that writes audit logs from Kafka events.
 * This offloads audit persistence from the main request thread.
 */
@Component
public class AuditEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(AuditEventConsumer.class);
    private final AuditLogRepository auditLogRepository;

    public AuditEventConsumer(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @KafkaListener(topics = "transaction-events", groupId = "audit-group")
    public void onTransactionEvent(TransactionEvent event) {
        log.info("[AUDIT-CONSUMER] Persisting audit for transaction: {}", event.getRequestId());
        try {
            String details = String.format("%s: %s → %s, amount=%s",
                    event.getEventType(), event.getFromAccount(),
                    event.getToAccount(), event.getAmount());

            auditLogRepository.save(new AuditLog(
                    event.getEventType(),
                    "Transaction",
                    event.getRequestId(),
                    event.getPerformedBy(),
                    details
            ));
        } catch (Exception e) {
            log.error("[AUDIT-CONSUMER] Failed to persist audit log: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "account-events", groupId = "audit-group")
    public void onAccountEvent(AccountEvent event) {
        log.info("[AUDIT-CONSUMER] Persisting audit for account: {}", event.getAccountNumber());
        try {
            String details = String.format("%s: account=%s, type=%s",
                    event.getEventType(), event.getAccountNumber(), event.getAccountType());

            auditLogRepository.save(new AuditLog(
                    event.getEventType(),
                    "Account",
                    event.getAccountNumber(),
                    event.getPerformedBy(),
                    details
            ));
        } catch (Exception e) {
            log.error("[AUDIT-CONSUMER] Failed to persist audit log: {}", e.getMessage());
        }
    }
}
