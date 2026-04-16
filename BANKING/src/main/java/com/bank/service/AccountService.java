package com.bank.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bank.entity.Account;
import com.bank.repository.AccountRepository;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    public Account createAccount(Account account){

        Account existingAccount =
                accountRepository.findByAccountNumber(account.getAccountNumber());

        if(existingAccount != null){
            throw new RuntimeException("Account number already exists");
        }


        Account existingUser =
                accountRepository.findByUserId(account.getUserId());

        if(existingUser != null){
            throw new RuntimeException("User ID already exists");
        }

        return accountRepository.save(account);
    }


    public double checkBalance(String accountNumber){

        Account acc =
                accountRepository.findByAccountNumber(accountNumber);

        if(acc == null){
            throw new RuntimeException("Account not found");
        }

        return acc.getBalance();
    }


    public Account deposit(String accountNumber, double amount){

        if(amount <= 0){
            throw new RuntimeException("Amount must be greater than 0");
        }

        Account acc =
                accountRepository.findByAccountNumber(accountNumber);

        if(acc == null){
            throw new RuntimeException("Account not found");
        }

        acc.setBalance(acc.getBalance() + amount);

        return accountRepository.save(acc);
    }


    public Account withdraw(String accountNumber, double amount){

        if(amount <= 0){
            throw new RuntimeException("Amount must be greater than 0");
        }

        Account acc =
                accountRepository.findByAccountNumber(accountNumber);

        if(acc == null){
            throw new RuntimeException("Account not found");
        }

        if(acc.getBalance() < amount){
            throw new RuntimeException("Insufficient Balance");
        }

        acc.setBalance(acc.getBalance() - amount);

        return accountRepository.save(acc);
    }

}