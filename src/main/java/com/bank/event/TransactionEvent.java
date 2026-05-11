package com.bank.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Domain event published when a financial transaction occurs.
 * Consumed by notification, audit, and analytics services asynchronously.
 */
public class TransactionEvent implements Serializable {

    private String eventType;       // DEPOSIT, WITHDRAWAL, TRANSFER
    private String fromAccount;
    private String toAccount;
    private BigDecimal amount;
    private String requestId;
    private String performedBy;     // username/email
    private LocalDateTime timestamp;

    public TransactionEvent() {}

    public TransactionEvent(String eventType, String fromAccount, String toAccount,
                            BigDecimal amount, String requestId, String performedBy) {
        this.eventType = eventType;
        this.fromAccount = fromAccount;
        this.toAccount = toAccount;
        this.amount = amount;
        this.requestId = requestId;
        this.performedBy = performedBy;
        this.timestamp = LocalDateTime.now();
    }

    // --- Getters & Setters ---
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getFromAccount() { return fromAccount; }
    public void setFromAccount(String fromAccount) { this.fromAccount = fromAccount; }

    public String getToAccount() { return toAccount; }
    public void setToAccount(String toAccount) { this.toAccount = toAccount; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    @Override
    public String toString() {
        return "TransactionEvent{" +
                "eventType='" + eventType + '\'' +
                ", fromAccount='" + fromAccount + '\'' +
                ", toAccount='" + toAccount + '\'' +
                ", amount=" + amount +
                ", requestId='" + requestId + '\'' +
                ", performedBy='" + performedBy + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
