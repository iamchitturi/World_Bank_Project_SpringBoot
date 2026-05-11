package com.bank.event;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Domain event published when an account lifecycle event occurs.
 * (CREATE, UPDATE, DELETE, BLOCK)
 */
public class AccountEvent implements Serializable {

    private String eventType;       // CREATED, DELETED, BLOCKED, UPDATED
    private String accountNumber;
    private Long userId;
    private String accountType;
    private String performedBy;
    private LocalDateTime timestamp;

    public AccountEvent() {}

    public AccountEvent(String eventType, String accountNumber, Long userId,
                        String accountType, String performedBy) {
        this.eventType = eventType;
        this.accountNumber = accountNumber;
        this.userId = userId;
        this.accountType = accountType;
        this.performedBy = performedBy;
        this.timestamp = LocalDateTime.now();
    }

    // --- Getters & Setters ---
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    @Override
    public String toString() {
        return "AccountEvent{" +
                "eventType='" + eventType + '\'' +
                ", accountNumber='" + accountNumber + '\'' +
                ", userId=" + userId +
                ", performedBy='" + performedBy + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
