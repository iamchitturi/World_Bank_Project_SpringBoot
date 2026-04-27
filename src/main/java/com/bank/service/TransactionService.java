package com.bank.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bank.entity.Account;
import com.bank.entity.Transaction;
import com.bank.repository.AccountRepository;
import com.bank.repository.TransactionRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TransactionService {

    private static final Logger log =
            LoggerFactory.getLogger(TransactionService.class);


    @Autowired
    private AccountRepository accountRepository;   // FIXED


    @Autowired
    private TransactionRepository transactionRepository;   // FIXED



    public String transfer(     // remove static
            String fromAcc,
            String toAcc,
            double amount){

        log.info("Transfer started from {} to {} amount {}",
                fromAcc,
                toAcc,
                amount);


        if(amount <= 0){

            log.error("Invalid transfer amount: {}", amount);

            throw new RuntimeException(
                    "Amount must be greater than 0");
        }


        Account sender =
                accountRepository
                        .findByAccountNumber(fromAcc);


        Account receiver =
                accountRepository
                        .findByAccountNumber(toAcc);



        if(sender == null){

            throw new RuntimeException(
                    "Sender account not found");
        }


        if(receiver == null){

            throw new RuntimeException(
                    "Receiver account not found");
        }



        if(sender.getBalance() < amount){

            throw new RuntimeException(
                    "Insufficient balance");
        }



        sender.setBalance(
                sender.getBalance() - amount);


        receiver.setBalance(
                receiver.getBalance() + amount);



        accountRepository.save(sender);
        accountRepository.save(receiver);



        Transaction txn =
                new Transaction();

        txn.setFromAccount(fromAcc);
        txn.setToAccount(toAcc);
        txn.setAmount(amount);
        txn.setDate(LocalDateTime.now());



        transactionRepository.save(txn);



        log.info("Transfer successful");


        return "Transfer successful";
    }



    public List<Transaction> getTransactionHistory(
            String accountNumber){

        return transactionRepository
                .findByFromAccountOrToAccount(
                        accountNumber,
                        accountNumber);
    }

}