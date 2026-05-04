package com.bank.repository;

import java.math.BigDecimal;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ReportRepository {

    private final JdbcTemplate jdbcTemplate;

    public ReportRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public BigDecimal totalBalance() {
        String sql = "SELECT COALESCE(SUM(balance), 0) FROM accounts";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class);
    }

    public BigDecimal totalTransactionVolume() {
        String sql = "SELECT COALESCE(SUM(amount), 0) FROM transactions";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class);
    }

    public Long activeAccountsCount() {
        String sql = "SELECT COUNT(*) FROM accounts";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }
}
