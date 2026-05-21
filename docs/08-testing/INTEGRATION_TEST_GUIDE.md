# Integration Test Guide

- Use Spring Boot integration tests for controller/security/repository interactions.
- Use Testcontainers/PostgreSQL paths for migration and tenant isolation confidence.
- Assert 401, 403, and 404/no-leak behavior for protected resources.
- Include tenant A vs tenant B data in cross-tenant tests.
- For payment/queue flows, test idempotency and retry-safe behavior.
