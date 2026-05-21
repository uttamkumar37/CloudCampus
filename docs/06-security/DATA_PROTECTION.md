# Data Protection

## Sensitive Data
- Passwords, OTPs, JWTs, refresh tokens, payment secrets, AI provider keys.
- Student PII, parent contact details, documents, medical records, payment data.

## Rules
- Do not log sensitive values.
- Use encryption/masking helpers where present.
- Validate document access before signing or returning URLs.
- Public analytics should not store raw PII.
- Demo anonymization migrations exist; keep demo data synthetic.
