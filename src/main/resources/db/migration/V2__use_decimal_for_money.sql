-- Switch monetary columns from DOUBLE to DECIMAL to avoid floating-point precision bugs.
ALTER TABLE accounts MODIFY COLUMN balance DECIMAL(19,4) NOT NULL;
ALTER TABLE transactions MODIFY COLUMN amount DECIMAL(19,4) NOT NULL;
