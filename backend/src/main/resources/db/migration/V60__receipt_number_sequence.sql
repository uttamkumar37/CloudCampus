-- CRIT-13: Replace COUNT-then-WRITE receipt numbering with an atomic DB sequence.
-- The old approach (countByReceiptNumberStartingWith) had a TOCTOU race condition
-- that allowed duplicate receipt numbers under concurrent payment load.
-- nextval('receipt_number_seq') is atomic and guaranteed unique per PostgreSQL docs.

CREATE SEQUENCE IF NOT EXISTS receipt_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Rollback: DROP SEQUENCE receipt_number_seq;
