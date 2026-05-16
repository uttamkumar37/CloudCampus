-- Align DB type with JPA mapping (@Column length=3 maps to VARCHAR(3) in Hibernate validation)
ALTER TABLE payment_orders
    ALTER COLUMN currency TYPE VARCHAR(3) USING TRIM(currency),
    ALTER COLUMN currency SET DEFAULT 'INR';
