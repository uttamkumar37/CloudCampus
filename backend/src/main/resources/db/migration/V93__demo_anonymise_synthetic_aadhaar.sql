-- ─────────────────────────────────────────────────────────────────────────────
-- V93: Make demo Aadhaar values obviously synthetic.
--
-- V91 seeded 1130 rows in student_identity_profiles with 12-digit numbers
-- starting with '5' under government_id_type='AADHAAR'. Even though these are
-- random hashes (no real-person mapping), the format mirrors a valid Aadhaar
-- and is a regulatory hazard if it ever ships in a customer instance or leaks
-- into a screenshot. Replace with an unambiguously-fake string.
--
-- Idempotent. Only updates rows that still match the synthetic 12-digit pattern
-- so re-running is safe and customer-supplied real IDs are never touched.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE student_identity_profiles
   SET government_id_type   = 'DEMO_AADHAAR',
       government_id_number = 'DEMO-' || SUBSTRING(government_id_number FROM 2 FOR 11)
 WHERE government_id_type   = 'AADHAAR'
   AND government_id_number ~ '^[0-9]{12}$'
   AND government_id_number LIKE '5%';
