package com.bank.controller;

import com.bank.api.ApiResponse;
import com.bank.dto.TransferDTO;
import com.bank.entity.Account;
import com.bank.service.AccountService;
import com.bank.service.TransactionService;
import jakarta.validation.Valid;
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
public class AccountController {

    private final AccountService accountService;
    private final TransactionService transactionService;

    public AccountController(AccountService accountService, TransactionService transactionService) {
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    @GetMapping("/page")
    public ApiResponse<Page<Account>> getAccountsPage(@RequestParam int page, @RequestParam int size) {
        return ApiResponse.<Page<Account>>builder()
                .success(true)
                .message("Accounts fetched")
                .data(accountService.getAccountsWithPagination(page, size))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/{accountNumber}")
    public ApiResponse<Account> getAccount(@PathVariable String accountNumber) {
        return ok(accountService.getAccount(accountNumber), "Account fetched");
    }

    @GetMapping("/interest/{accountNumber}")
    public ApiResponse<Double> interest(@PathVariable String accountNumber) {
        Account acc = accountService.getAccount(accountNumber);
        return ok(accountService.calculateInterest(acc.getBalance()), "Interest calculated");
    }

    @PutMapping("/update/{accountNumber}")
    public ApiResponse<Account> update(@PathVariable String accountNumber, @Valid @RequestBody Account account) {
        return ok(accountService.updateAccount(accountNumber, account), "Account updated");
    }

    @PostMapping("/transfer")
    public ApiResponse<String> transfer(@Valid @RequestBody TransferDTO dto) {
        return ok(transactionService.transfer(dto.getFromAcc(), dto.getToAcc(), dto.getAmount(), dto.getRequestId()),
                "Transfer complete");
    }

    @DeleteMapping("/delete/{accountNumber}")
    public ApiResponse<String> delete(@PathVariable String accountNumber) {
        return ok(accountService.deleteAccount(accountNumber), "Account deleted");
    }

    @GetMapping("/all")
    public ApiResponse<List<Account>> getAll() {
        return ok(accountService.getAllAccounts(), "Accounts fetched");
    }

    @PostMapping("/create")
    public ApiResponse<Account> createAccount(@Valid @RequestBody Account account) {
        return ok(accountService.createAccount(account), "Account created");
    }

    @GetMapping("/balance/{accountNumber}")
    public ApiResponse<Double> getBalance(@PathVariable String accountNumber) {
        return ok(accountService.checkBalance(accountNumber), "Balance fetched");
    }

    @PostMapping("/deposit")
    public ApiResponse<Account> deposit(@RequestParam String accountNumber, @RequestParam double amount) {
        return ok(accountService.deposit(accountNumber, amount), "Deposit successful");
    }

    @PostMapping("/withdraw")
    public ApiResponse<Account> withdraw(@RequestParam String accountNumber, @RequestParam double amount) {
        return ok(accountService.withdraw(accountNumber, amount), "Withdraw successful");
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
