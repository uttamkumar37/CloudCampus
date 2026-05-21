# Rate Limiting

## Redis-Backed Limits Detected
- Login lockout/rate limiting.
- General API/public rate limit services.
- AI gateway usage throttling.
- Public rate-limit interceptor.

## Required Limits
- Login and password reset endpoints.
- Public website analytics/event endpoints.
- AI copilot and RAG endpoints.
- Upload and payment initiation endpoints.
- Investor room unlock attempts.

## Rules
- Rate keys must include tenant or actor when authenticated and IP/client fingerprint when public.
- Do not let public endpoint failures reveal tenant/customer existence.
