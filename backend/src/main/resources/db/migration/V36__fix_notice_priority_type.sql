-- Fix: Hibernate expects INTEGER for int field, but column was created as SMALLINT.
ALTER TABLE school_notices
    ALTER COLUMN priority TYPE INTEGER USING priority::INTEGER;
