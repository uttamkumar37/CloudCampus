-- ─────────────────────────────────────────────────────────────────────────────
-- V92: Remove maintainer PII from demo seed data.
--
-- Earlier seeds embedded the project maintainer's real name + email + phone
-- in the JNV Lucknow demo school admin (jnv.admin / EMP JNV-ADMIN-001).
-- Replace with neutral demo values so a freshly cloned dev DB doesn't expose
-- the maintainer.
--
-- Idempotent. Only updates the JNV-ADMIN row and only if the name field
-- still matches the old value, so re-running is safe.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE staff
   SET first_name = 'Demo',
       last_name  = 'Administrator',
       email      = 'admin@jnv-lucknow-demo.test',
       phone      = '+910000000000'
 WHERE employee_number = 'JNV-ADMIN-001'
   AND first_name = 'Uttam'
   AND last_name  = 'Kumar';
