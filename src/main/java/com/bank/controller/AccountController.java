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
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/account")
@Tag(name = "Accounts", description = "Create, manage, deposit, withdraw, and transfer funds")
public class AccountController {

    private final AccountService accountService;
    private final TransactionService transactionService;

    public AccountController(AccountService accountService, TransactionService transactionService) {
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    // ---- Customer endpoint: get own account ----
    @GetMapping("/my")
    @Operation(summary = "My account", description = "Get the currently authenticated user's bank account")
    public ApiResponse<Account> getMyAccount() {
        return ok(accountService.getMyAccount(), "Account fetched");
    }

    // ---- Admin-only endpoints ----
    @GetMapping("/all")
    @Operation(summary = "Get all accounts (ADMIN)", description = "Retrieve all bank accounts")
    public ApiResponse<List<Account>> getAll() {
        return ok(accountService.getAllAccounts(), "Accounts fetched");
    }

    @GetMapping("/page")
    @Operation(summary = "Get accounts paginated (ADMIN)", description = "Retrieve accounts with pagination")
    public ApiResponse<Page<Account>> getAccountsPage(@RequestParam int page, @RequestParam int size) {
        return ApiResponse.<Page<Account>>builder()
                .success(true)
                .message("Accounts fetched")
                .data(accountService.getAccountsWithPagination(page, size))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping("/create")
    @Operation(summary = "Create account (ADMIN)", description = "Create a new bank account for an existing user")
    public ApiResponse<Account> createAccount(@Valid @RequestBody CreateAccountDTO dto) {
        return ok(accountService.createAccount(dto), "Account created");
    }

    @DeleteMapping("/delete/{accountNumber}")
    @Operation(summary = "Delete account (ADMIN)", description = "Delete a bank account permanently")
    public ApiResponse<String> delete(@PathVariable String accountNumber) {
        return ok(accountService.deleteAccount(accountNumber), "Account deleted");
    }

    // ---- Authenticated endpoints (ownership enforced) ----
    @GetMapping("/{accountNumber}")
    @Operation(summary = "Get account", description = "Retrieve account details (own account for USER, any for ADMIN)")
    public ApiResponse<Account> getAccount(@PathVariable String accountNumber) {
        accountService.enforceOwnership(accountNumber);
        return ok(accountService.getAccount(accountNumber), "Account fetched");
    }

    @GetMapping("/balance/{accountNumber}")
    @Operation(summary = "Check balance", description = "Get the current balance (own account for USER)")
    public ApiResponse<BigDecimal> getBalance(@PathVariable String accountNumber) {
        accountService.enforceOwnership(accountNumber);
        return ok(accountService.checkBalance(accountNumber), "Balance fetched");
    }

    @PostMapping("/deposit")
    @Operation(summary = "Deposit funds", description = "Deposit money (own account for USER)")
    public ApiResponse<Account> deposit(@RequestParam String accountNumber, @RequestParam BigDecimal amount) {
        accountService.enforceOwnership(accountNumber);
        return ok(accountService.deposit(accountNumber, amount), "Deposit successful");
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw funds", description = "Withdraw money (own account for USER)")
    public ApiResponse<Account> withdraw(@RequestParam String accountNumber, @RequestParam BigDecimal amount) {
        accountService.enforceOwnership(accountNumber);
        return ok(accountService.withdraw(accountNumber, amount), "Withdraw successful");
    }

    @GetMapping("/interest/{accountNumber}")
    @Operation(summary = "Calculate interest", description = "Calculate annual interest (3.5%) on balance")
    public ApiResponse<BigDecimal> interest(@PathVariable String accountNumber) {
        accountService.enforceOwnership(accountNumber);
        Account acc = accountService.getAccount(accountNumber);
        return ok(accountService.calculateInterest(acc.getBalance()), "Interest calculated");
    }

    @PutMapping("/update/{accountNumber}")
    @Operation(summary = "Update account", description = "Update account holder name (own account for USER)")
    public ApiResponse<Account> update(@PathVariable String accountNumber, @Valid @RequestBody Account account) {
        accountService.enforceOwnership(accountNumber);
        return ok(accountService.updateAccount(accountNumber, account), "Account updated");
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer funds", description = "Transfer money between accounts (idempotent via requestId)")
    public ApiResponse<String> transfer(@Valid @RequestBody TransferDTO dto) {
        accountService.enforceOwnership(dto.getFromAcc());
        return ok(transactionService.transfer(dto.getFromAcc(), dto.getToAcc(), dto.getAmount(), dto.getRequestId()),
                "Transfer complete");
    }

    private <T> ApiResponse<T> ok(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
