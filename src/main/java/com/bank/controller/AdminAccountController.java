package com.bank.controller;

import com.bank.api.ApiResponse;
import com.bank.entity.Account;
import com.bank.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/accounts")
@Tag(name = "Admin Accounts", description = "Admin-only account management operations")
public class AdminAccountController {

    private final AccountService accountService;

    public AdminAccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/all")
    @Operation(summary = "Get all accounts", description = "Fetch all accounts across the entire bank")
    public ApiResponse<List<Account>> getAll() {
        return ok(accountService.getAllAccounts(), "Accounts fetched");
    }

    @GetMapping("/page")
    @Operation(summary = "Get accounts paginated", description = "Fetch accounts with pagination")
    public ApiResponse<Page<Account>> getAccountsPage(@RequestParam int page, @RequestParam int size) {
        return ok(accountService.getAccountsWithPagination(page, size), "Accounts fetched");
    }
    
    @GetMapping("/{accountNumber}")
    @Operation(summary = "Get account details", description = "View details of any specific account")
    public ApiResponse<Account> getAccount(@PathVariable String accountNumber) {
        return ok(accountService.getAccount(accountNumber), "Account fetched");
    }

    @DeleteMapping("/delete/{accountNumber}")
    @Operation(summary = "Delete account", description = "Permanently delete an account and its linked cards")
    public ApiResponse<String> delete(@PathVariable String accountNumber) {
        return ok(accountService.deleteAccount(accountNumber), "Account deleted");
    }

    private <T> ApiResponse<T> ok(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true).message(message).data(data).timestamp(LocalDateTime.now()).build();
    }
}
