package com.bank.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "accounts", uniqueConstraints = {
        @UniqueConstraint(name = "uk_account_number", columnNames = "account_number")
})
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Account number required")
    @Column(name = "account_number", nullable = false, unique = true)
    private String accountNumber;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank(message = "Name required")
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Column(name = "account_type", nullable = false, length = 20)
    private String accountType = "SAVINGS";

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Version
    private Long version;
}
