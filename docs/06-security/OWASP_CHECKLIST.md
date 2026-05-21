# OWASP Checklist

## API Security
- Broken object level authorization: enforce tenant and school ownership on every entity lookup.
- Broken authentication: preserve JWT validation, refresh rotation, BCrypt, lockout, and rate limits.
- Broken object property authorization: never bind sensitive fields directly from client payloads.
- Unrestricted resource consumption: rate-limit public/auth/AI/upload APIs.
- Broken function authorization: route and method RBAC must match business role.
- Mass assignment: request DTOs should expose only intended fields.
- SSRF/file risk: validate uploads, URLs, domains, and public website assets.
- Security misconfiguration: keep CORS restricted and actuator exposure limited.
- Vulnerable components: review `security-nightly.yml` OWASP and Trivy reports.
- Unsafe consumption of APIs: validate payment webhooks and AI provider responses.
