-- V7: Convert audit_log.ip_address from PostgreSQL INET type to VARCHAR(45).
--
-- Root cause: V4 used INET for type-safety at the DB level, but Hibernate
-- JPA maps java.lang.String fields to VARCHAR which fails schema-validation.
-- Converting to VARCHAR(45) covers IPv4 (max 15 chars) and IPv6 (max 39 chars)
-- while keeping JPA compatibility. IP-address format validation is handled at
-- the application layer (service / controller validation annotations).

ALTER TABLE audit_log
    ALTER COLUMN ip_address TYPE VARCHAR(45) USING ip_address::VARCHAR;
