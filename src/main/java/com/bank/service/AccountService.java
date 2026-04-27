package com.bank.service;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bank.entity.Account;
import com.bank.repository.AccountRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AccountService {

	public Page<Account> getAccountsWithPagination(
	        int page,
	        int size){

	    Pageable pageable =
	            PageRequest.of(page, size);

	    return accountRepository
	            .findAll(pageable);
	}
	public double calculateInterest(double balance){

	    double rate = 3.5;

	    return balance * rate / 100;
	}
    private static final Logger log =
            LoggerFactory.getLogger(AccountService.class);


    @Autowired
    private AccountRepository accountRepository;


    // CREATE ACCOUNT
    public Account createAccount(Account account){

        log.info("Create account request started");

        Account existingAccount =
                accountRepository
                        .findByAccountNumber(
                                account.getAccountNumber());

        if(existingAccount != null){

            log.error("Account already exists with number: {}",
                    account.getAccountNumber());

            throw new RuntimeException(
                    "Account number already exists");
        }


        Account existingUser =
                accountRepository
                        .findByUserId(account.getUserId());

        if(existingUser != null){

            log.error("User ID already exists: {}",
                    account.getUserId());

            throw new RuntimeException(
                    "User ID already exists");
        }

        Account savedAccount =
                accountRepository.save(account);

        log.info("Account created successfully: {}",
                savedAccount.getAccountNumber());

        return savedAccount;
    }
    public Account getAccount(String accountNumber){

        Account acc =
                accountRepository
                        .findByAccountNumber(accountNumber);

        if(acc == null){

            throw new RuntimeException(
                    "Account not found");
        }

        return acc;
    }



    // CHECK BALANCE
    public double checkBalance(String accountNumber){

        log.info("Checking balance for account: {}",
                accountNumber);

        Account acc =
                accountRepository
                        .findByAccountNumber(accountNumber);

        if(acc == null){

            log.error("Account not found: {}",
                    accountNumber);

            throw new RuntimeException(
                    "Account not found");
        }

        return acc.getBalance();
    }



    // DEPOSIT
    public Account deposit(
            String accountNumber,
            double amount){

        log.info("Deposit started for account: {}",
                accountNumber);

        if(amount <= 0){

            log.error("Invalid deposit amount: {}",
                    amount);

            throw new RuntimeException(
                    "Amount must be greater than 0");
        }

        Account acc =
                accountRepository
                        .findByAccountNumber(accountNumber);

        if(acc == null){

            log.error("Deposit failed - account not found: {}",
                    accountNumber);

            throw new RuntimeException(
                    "Account not found");
        }

        acc.setBalance(
                acc.getBalance() + amount);

        Account updated =
                accountRepository.save(acc);

        log.info("Deposit successful. Amount: {} New Balance: {}",
                amount,
                updated.getBalance());

        return updated;
    }



    // WITHDRAW
    public Account withdraw(
            String accountNumber,
            double amount){

        log.info("Withdraw started for account: {}",
                accountNumber);

        if(amount <= 0){

            log.error("Invalid withdraw amount: {}",
                    amount);

            throw new RuntimeException(
                    "Amount must be greater than 0");
        }

        Account acc =
                accountRepository
                        .findByAccountNumber(accountNumber);

        if(acc == null){

            log.error("Withdraw failed - account not found: {}",
                    accountNumber);

            throw new RuntimeException(
                    "Account not found");
        }

        if(acc.getBalance() < amount){

            log.error("Insufficient balance. Available: {} Requested: {}",
                    acc.getBalance(),
                    amount);

            throw new RuntimeException(
                    "Insufficient balance");
        }

        acc.setBalance(
                acc.getBalance() - amount);

        Account updated =
                accountRepository.save(acc);

        log.info("Withdraw successful. Amount: {} Remaining Balance: {}",
                amount,
                updated.getBalance());

        return updated;
    }



    // DELETE ACCOUNT
    public String deleteAccount(String accountNumber){

        log.info("Delete request for account: {}",
                accountNumber);

        Account acc =
                accountRepository
                        .findByAccountNumber(accountNumber);

        if(acc == null){

            log.error("Delete failed - account not found: {}",
                    accountNumber);

            throw new RuntimeException(
                    "Account not found");
        }

        accountRepository.delete(acc);

        log.info("Account deleted successfully: {}",
                accountNumber);

        return "Account deleted successfully";
    }

    public Account updateAccount(
            String accountNumber,
            Account updatedAccount){

        Account acc =
                accountRepository
                        .findByAccountNumber(accountNumber);

        if(acc == null){
            throw new RuntimeException("Account not found");
        }

        acc.setName(updatedAccount.getName());

        return accountRepository.save(acc);
    }
    public List<Account> getAllAccounts(){

        return accountRepository.findAll();
    }

}