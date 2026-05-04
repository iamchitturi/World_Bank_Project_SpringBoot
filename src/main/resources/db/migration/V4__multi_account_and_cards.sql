-- V4: Multi-account + account types + cards (already applied manually)

-- Drop unique constraint on user_id to allow multiple accounts per user
-- ALTER TABLE accounts DROP FOREIGN KEY fk_account_user;
-- ALTER TABLE accounts DROP INDEX user_id;
-- ALTER TABLE accounts ADD CONSTRAINT fk_account_user FOREIGN KEY (user_id) REFERENCES users(id);

-- Add account type
-- ALTER TABLE accounts ADD COLUMN account_type VARCHAR(20) NOT NULL DEFAULT 'SAVINGS';

-- Add created_at
-- ALTER TABLE accounts ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Cards table already created

SELECT 1;
