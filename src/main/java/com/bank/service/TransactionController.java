package com.bank.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bank.service.TransactionService;

@RestController
@RequestMapping("/transaction")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/transfer")
    public String transferMoney(
            @RequestParam String fromAccount,
            @RequestParam String toAccount,
            @RequestParam double amount){

        return transactionService.transfer(fromAccount, toAccount, amount);
    }
}