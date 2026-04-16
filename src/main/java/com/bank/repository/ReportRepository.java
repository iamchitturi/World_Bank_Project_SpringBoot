package com.bank.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class ReportRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Double totalBalance(){

        String sql = "SELECT SUM(balance) FROM account";

        return jdbcTemplate.queryForObject(sql, Double.class);
    }
}