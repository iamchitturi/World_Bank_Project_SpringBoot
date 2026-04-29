package com.bank.controller;

import com.bank.api.ApiResponse;
import com.bank.entity.Transaction;
import com.bank.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/transaction")
@Tag(name = "Transactions", description = "View transaction history")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/history/{accountNumber}")
    @Operation(summary = "Transaction history", description = "Get all transactions for an account (sent and received)")
    public ApiResponse<List<Transaction>> history(@PathVariable String accountNumber) {
        return ApiResponse.<List<Transaction>>builder()
                .success(true)
                .message("Transaction history fetched")
                .data(transactionService.getTransactionHistory(accountNumber))
                .timestamp(LocalDateTime.now())
                .build();
    }
}
