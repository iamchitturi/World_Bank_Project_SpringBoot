package com.bank.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bank.entity.Transaction;
import com.bank.entity.Account;
import com.bank.repository.TransactionRepository;
import com.bank.repository.AccountRepository;

import java.time.LocalDateTime;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    public String transfer(String fromAcc, String toAcc, double amount){

        if(amount <= 0){
            return "Amount must be greater than 0";
        }

        Account sender =
                accountRepository.findByAccountNumber(fromAcc);

        Account receiver =
                accountRepository.findByAccountNumber(toAcc);

        if(sender == null){
            return "Sender account not found";
        }

        if(receiver == null){
            return "Receiver account not found";
        }

        if(sender.getBalance() < amount){
            return "Insufficient Balance";
        }

        sender.setBalance(sender.getBalance() - amount);

        receiver.setBalance(receiver.getBalance() + amount);

        accountRepository.save(sender);

        accountRepository.save(receiver);

        Transaction txn = new Transaction();

        txn.setFromAccount(fromAcc);
        txn.setToAccount(toAcc);
        txn.setAmount(amount);
        txn.setDate(LocalDateTime.now());

        transactionRepository.save(txn);

        return "Transfer Successful";
    }
}