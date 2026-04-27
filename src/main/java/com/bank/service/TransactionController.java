package com.bank.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bank.entity.Transaction;
import com.bank.service.TransactionService;

@RestController
@RequestMapping("/transaction")
public class TransactionController {

    @Autowired
    TransactionService transactionService;


    @PostMapping("/transfer")
    public String transfer(
            @RequestParam String fromAcc,
            @RequestParam String toAcc,
            @RequestParam double amount){

        return transactionService
                .transfer(fromAcc,toAcc,amount);
    }


    @GetMapping("/history/{accountNumber}")
    public List<Transaction> history(
            @PathVariable String accountNumber){

        return transactionService
                .getTransactionHistory(accountNumber);
    }

}