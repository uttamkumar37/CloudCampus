# Load Testing

## Repo Support
`infra/load-tests` contains smoke, stress, auth, public website, reports, and school-admin load scripts.

## Critical Scenarios
- Login bursts and lockout behavior.
- Attendance marking during morning peak.
- Fee payment initiation and webhook processing.
- Public website/demo/investor-room traffic.
- Report generation.
- AI copilot throttling.

## Rules
- Run load tests against staging-like data volumes.
- Monitor Postgres, Redis, RabbitMQ, JVM, and queue DLQs.
