package com.bank.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bank.entity.Account;
import com.bank.service.AccountService;

@RestController
@RequestMapping("/account")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @PostMapping("/create")
    public Account createAccount(@RequestBody Account account){

        return accountService.createAccount(account);
    }

    @GetMapping("/balance/{accountNumber}")
    public double getBalance(@PathVariable String accountNumber){

        return accountService.checkBalance(accountNumber);
    }
    @PostMapping("/deposit")
    public Account deposit(
            @RequestParam String accountNumber,
            @RequestParam double amount){

        return accountService.deposit(accountNumber, amount);
    }
    @PostMapping("/withdraw")
    public Account withdraw(
            @RequestParam String accountNumber,
            @RequestParam double amount){

        return accountService.withdraw(accountNumber, amount);
    }
    

}