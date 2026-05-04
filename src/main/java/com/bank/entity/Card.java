package com.bank.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "cards")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "card_number", nullable = false, unique = true, length = 19)
    private String cardNumber;

    @Column(name = "card_type", nullable = false, length = 10)
    private String cardType; // DEBIT or CREDIT

    @Column(name = "cardholder_name", nullable = false)
    private String cardholderName;

    @JsonIgnore
    @Column(nullable = false, length = 4)
    private String cvv;

    @Column(name = "expiry_date", nullable = false, length = 7)
    private String expiryDate; // MM/YY

    @Column(nullable = false, length = 10)
    private String status = "ACTIVE"; // ACTIVE, BLOCKED

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Return masked card number for display (show last 4 digits) */
    public String getMaskedNumber() {
        if (cardNumber == null || cardNumber.length() < 4) return "****";
        return "**** **** **** " + cardNumber.substring(cardNumber.length() - 4);
    }
}
