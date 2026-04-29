package com.bank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAccountDTO {

    @NotBlank(message = "Account number required")
    private String accountNumber;

    @NotNull(message = "User ID required")
    private Long userId;

    @NotBlank(message = "Name required")
    private String name;
}
