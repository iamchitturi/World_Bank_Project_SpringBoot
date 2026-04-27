package com.bank.controller;

import java.util.List;
import com.bank.service.TransactionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import com.bank.dto.TransferDTO;
import com.bank.entity.Account;
import com.bank.service.AccountService;


@RestController
@RequestMapping("/account")
public class AccountController {
	@GetMapping("/page")
	public Page<Account> getAccountsPage(

	        @RequestParam int page,
	        @RequestParam int size){

	    return accountService
	            .getAccountsWithPagination(
	                    page,
	                    size);
	}
	@GetMapping("/{accountNumber}")
	public Account getAccount(
	        @PathVariable String accountNumber){

	    return accountService.getAccount(accountNumber);
	}
	@GetMapping("/interest/{accountNumber}")
	public double interest(
	        @PathVariable String accountNumber){

	    Account acc =
	            accountService.getAccount(accountNumber);

	    return accountService
	            .calculateInterest(acc.getBalance());
	}
	@PutMapping("/update/{accountNumber}")
	public Account update(
	        @PathVariable String accountNumber,
	        @RequestBody Account account){

	    return accountService
	            .updateAccount(accountNumber,account);
	}
	@PostMapping("/transfer")
	public String transfer(
	        @RequestBody TransferDTO dto){

	    return TransactionService.transfer(
	            dto.getFromAcc(),
	            dto.getToAcc(),
	            dto.getAmount());
	}
	@DeleteMapping("/delete/{accountNumber}")
	public String delete(
	        @PathVariable String accountNumber){

	    return accountService
	            .deleteAccount(accountNumber);
	}
	@GetMapping("/all")
	public List<Account> getAll(){

	    return accountService.getAllAccounts();
	}

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