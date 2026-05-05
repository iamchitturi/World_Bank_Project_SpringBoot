package com.bank.controller;

import com.bank.api.ApiResponse;
import com.bank.dto.CreateAccountDTO;
import com.bank.dto.TransferDTO;
import com.bank.entity.Account;
import com.bank.service.AccountService;
import com.bank.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/accounts")
@Tag(name = "Customer Accounts", description = "Manage your bank accounts and perform transactions")
public class CustomerAccountController {

    private final AccountService accountService;
    private final TransactionService transactionService;

    public CustomerAccountController(AccountService accountService, TransactionService transactionService) {
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    @GetMapping("/my")
    @Operation(summary = "My accounts", description = "Get all accounts for the logged-in user")
    public ApiResponse<List<Account>> getMyAccounts() {
        return ok(accountService.getMyAccounts(), "Accounts fetched");
    }

    @PostMapping("/create")
    @Operation(summary = "Create account", description = "Open a new bank account")
    public ApiResponse<Account> createAccount(@Valid @RequestBody CreateAccountDTO dto) {
        return ok(accountService.createAccount(dto), "Account created");
    }

    @GetMapping("/{accountNumber}")
    @Operation(summary = "Get account details", description = "Get account by number (strict ownership enforced)")
    public ApiResponse<Account> getAccount(@PathVariable String accountNumber) {
        accountService.enforceOwnership(accountNumber);
        return ok(accountService.getAccount(accountNumber), "Account fetched");
    }

    @GetMapping("/balance/{accountNumber}")
    @Operation(summary = "Check balance")
    public ApiResponse<BigDecimal> getBalance(@PathVariable String accountNumber) {
        accountService.enforceOwnership(accountNumber);
        return ok(accountService.checkBalance(accountNumber), "Balance fetched");
    }

    @PostMapping("/deposit")
    @Operation(summary = "Deposit funds")
    public ApiResponse<Account> deposit(@RequestParam String accountNumber, 
                                        @RequestParam BigDecimal amount,
                                        @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
        if (idempotencyKey == null) idempotencyKey = java.util.UUID.randomUUID().toString();
        accountService.enforceStrictOwnership(accountNumber);
        return ok(accountService.deposit(accountNumber, amount, idempotencyKey), "Deposit successful");
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw funds")
    public ApiResponse<Account> withdraw(@RequestParam String accountNumber, 
                                         @RequestParam BigDecimal amount,
                                         @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
        if (idempotencyKey == null) idempotencyKey = java.util.UUID.randomUUID().toString();
        accountService.enforceStrictOwnership(accountNumber);
        return ok(accountService.withdraw(accountNumber, amount, idempotencyKey), "Withdraw successful");
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer funds", description = "Transfer money between your account and another")
    public ApiResponse<String> transfer(@Valid @RequestBody TransferDTO dto) {
        accountService.enforceStrictOwnership(dto.getFromAcc());
        return ok(transactionService.transfer(dto.getFromAcc(), dto.getToAcc(), dto.getAmount(), dto.getRequestId()),
                "Transfer complete");
    }

    @GetMapping("/interest/{accountNumber}")
    @Operation(summary = "Calculate interest")
    public ApiResponse<BigDecimal> interest(@PathVariable String accountNumber) {
        accountService.enforceOwnership(accountNumber);
        Account acc = accountService.getAccount(accountNumber);
        return ok(accountService.calculateInterest(acc.getBalance()), "Interest calculated");
    }

    private <T> ApiResponse<T> ok(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true).message(message).data(data).timestamp(LocalDateTime.now()).build();
    }
}
