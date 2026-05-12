-- V4: Multi-account + account types + cards 

-- Drop unique constraint on user_id to allow multiple accounts per user
ALTER TABLE accounts DROP FOREIGN KEY fk_account_user;
ALTER TABLE accounts DROP INDEX user_id;
ALTER TABLE accounts ADD CONSTRAINT fk_account_user FOREIGN KEY (user_id) REFERENCES users(id);

-- Add account type
ALTER TABLE accounts ADD COLUMN account_type VARCHAR(20) NOT NULL DEFAULT 'SAVINGS';

-- Add created_at
ALTER TABLE accounts ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL,
    card_number VARCHAR(19) NOT NULL UNIQUE,
    card_type VARCHAR(10) NOT NULL,
    cardholder_name VARCHAR(255) NOT NULL,
    cvv VARCHAR(4) NOT NULL,
    expiry_date VARCHAR(7) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_card_account FOREIGN KEY (account_id) REFERENCES accounts(id)
);
