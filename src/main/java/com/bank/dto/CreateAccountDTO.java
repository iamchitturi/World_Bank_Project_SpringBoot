package com.bank.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAccountDTO {

    @NotBlank(message = "Account holder name is required")
    private String name;

    @NotBlank(message = "Account type is required (SAVINGS, PREMIUM, CURRENT)")
    private String accountType;

    // userId is set from JWT token (customer creates for themselves)
    // or from request body (admin creates for any user)
    private Long userId;
}
