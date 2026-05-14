-- V40: Widen PII columns to fit AES-256-GCM encrypted values (CC-1803).
--
-- Encryption expands each value:
--   stored = "ENC:" + Base64( 12-byte IV || plaintext-bytes || 16-byte GCM tag )
--   worst-case overhead ≈ 4 + ceil((N + 28) / 3) * 4  characters
--
-- Examples:
--   phone   30  chars → ~84  chars encrypted  → widened to 500
--   address 500 chars → ~708 chars encrypted  → widened to 1000
--   email   200 chars → ~308 chars encrypted  → widened to 500
--
-- The converter is backward-compatible: existing plaintext rows are read as-is
-- and re-encrypted on the next JPA save (lazy migration).

-- ── students ─────────────────────────────────────────────────────────────────

ALTER TABLE students
    ALTER COLUMN phone   TYPE VARCHAR(500),
    ALTER COLUMN address TYPE VARCHAR(1000);

-- ── staff ─────────────────────────────────────────────────────────────────────

ALTER TABLE staff
    ALTER COLUMN phone   TYPE VARCHAR(500),
    ALTER COLUMN email   TYPE VARCHAR(500),
    ALTER COLUMN address TYPE VARCHAR(1000);
