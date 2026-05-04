package com.bank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCardDTO {

    @NotBlank(message = "Card type is required (DEBIT or CREDIT)")
    private String cardType;

    @NotNull(message = "Account ID is required")
    private Long accountId;
}
