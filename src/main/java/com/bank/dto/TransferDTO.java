package com.bank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransferDTO {

    @NotBlank
    private String fromAcc;

    @NotBlank
    private String toAcc;

    @NotNull
    @Positive
    private Double amount;

    @NotBlank
    private String requestId;
}
