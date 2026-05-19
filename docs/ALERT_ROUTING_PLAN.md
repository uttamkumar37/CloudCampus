# Alert Routing Plan

## Scope

This plan defines the production Alertmanager routing model for CloudCampus
alerts. It covers owner, route, severity, runbook, and escalation path for the
current Prometheus alert rules in `infra/prometheus/alert_rules.yml`.

The current `infra/alertmanager/alertmanager.yml` is wired to Alertmanager but
uses placeholder email delivery through `localhost:25`. Before Standard or
Enterprise launch, production must replace that placeholder with real PagerDuty,
Slack, and backup email receivers.

## Routing Principles

- Critical alerts page the on-call owner through PagerDuty.
- Warning alerts notify Slack and create a trackable follow-up if they remain
  active beyond the repeat interval.
- Every routed alert must include a runbook link or a named playbook section.
- Tenant-impacting alerts must notify customer success after incident
  declaration, not before triage confirms blast radius.
- Alertmanager should continue sending resolved notifications for critical
  routes so responders know when to validate recovery.
- `dev-null` is acceptable only for local development.

## Production Receivers

| Receiver | Channel | Purpose |
|---|---|---|
| `pagerduty-platform-critical` | PagerDuty | P1/P2 paging for backend, DB pool, Redis, JVM, and backup freshness. |
| `slack-platform-alerts` | Slack `#cloudcampus-alerts` | Warning alerts and critical alert mirror for shared visibility. |
| `slack-ai-ops` | Slack `#cloudcampus-ai-ops` | AI budget and AI failure-rate warnings. |
| `slack-release-ops` | Slack `#cloudcampus-release-ops` | Backup, disk, deployment, and promotion-gate alerts. |
| `ops-email` | Email | Backup notification path when PagerDuty or Slack delivery fails. |

Secrets must be injected through deployment secrets:

- `PAGERDUTY_PLATFORM_ROUTING_KEY`
- `SLACK_ALERTS_WEBHOOK_URL`
- `SLACK_AI_OPS_WEBHOOK_URL`
- `SLACK_RELEASE_OPS_WEBHOOK_URL`
- `ALERTMANAGER_SMTP_SMARTHOST`
- `ALERTMANAGER_SMTP_USERNAME`
- `ALERTMANAGER_SMTP_PASSWORD`

## Alertmanager Routing Blueprint

Production Alertmanager should keep severity routing, then add team/domain
routes as alert labels mature:

```yaml
route:
  group_by: ['alertname', 'severity', 'tenant_code']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: slack-platform-alerts
  routes:
    - match:
        severity: critical
      receiver: pagerduty-platform-critical
      repeat_interval: 30m
      continue: true
    - match_re:
        alertname: 'AIBudgetBurnRateHigh|AIUsageFailureRateHigh'
      receiver: slack-ai-ops
      repeat_interval: 4h
    - match_re:
        alertname: 'BackupNotFresh|BackupMetricAbsent|DiskSpaceHigh'
      receiver: slack-release-ops
      repeat_interval: 2h
```

Critical routes should also mirror to Slack with `continue: true` so the
incident channel sees the page.

## Current Alert Route Matrix

| Alert | Severity | Owner | Primary route | Secondary route | Runbook | Escalation |
|---|---|---|---|---|---|---|
| `BackendDown` | critical | Platform on-call | PagerDuty `platform-critical` | Slack `#cloudcampus-alerts` | `docs/INCIDENT_RUNBOOK.md` §7 + health checks | Incident commander -> Engineering lead -> CTO |
| `ConnectionPoolNearExhaustion` | critical | Backend/platform on-call | PagerDuty `platform-critical` | Slack `#cloudcampus-alerts` | `docs/DATABASE_INDEX_AUDIT.md` + DB pool triage | Backend lead -> DBA/DevOps -> CTO |
| `JvmHeapCritical` | critical | Backend/platform on-call | PagerDuty `platform-critical` | Slack `#cloudcampus-alerts` | `docs/INCIDENT_RUNBOOK.md` §7 | Backend lead -> DevOps -> CTO |
| `RedisDown` | critical | Platform on-call | PagerDuty `platform-critical` | Slack `#cloudcampus-alerts` | `docs/INCIDENT_RUNBOOK.md` PB-2 | DevOps -> Engineering lead -> CTO |
| `BackupNotFresh` | critical | DevOps on-call | PagerDuty `platform-critical` | Slack `#cloudcampus-release-ops` | `docs/INCIDENT_RUNBOOK.md` PB-1 | DevOps -> Engineering lead -> CTO |
| `HighErrorRate` | warning | Backend owner | Slack `#cloudcampus-alerts` | Email `ops@cloudcampus.io` | `docs/INCIDENT_RUNBOOK.md` §7 | Backend lead if active > 30 min |
| `HighP95Latency` | warning | Backend owner | Slack `#cloudcampus-alerts` | Email `ops@cloudcampus.io` | `docs/SEEDED_STAGING_LOAD_TEST_PLAN.md` latency goals | Backend lead if active > 1 h |
| `JvmHeapHigh` | warning | Backend owner | Slack `#cloudcampus-alerts` | Email `ops@cloudcampus.io` | JVM dashboard + heap investigation | Backend lead if active > 1 h |
| `RabbitMQQueueDepthHigh` | warning | Notifications/platform owner | Slack `#cloudcampus-alerts` | Email `ops@cloudcampus.io` | `docs/INCIDENT_RUNBOOK.md` PB-3 | Platform owner if active > 30 min |
| `BackupMetricAbsent` | warning | DevOps owner | Slack `#cloudcampus-release-ops` | Email `ops@cloudcampus.io` | `docs/INCIDENT_RUNBOOK.md` PB-1 | DevOps if active > 1 h |
| `DiskSpaceHigh` | warning | DevOps owner | Slack `#cloudcampus-release-ops` | Email `ops@cloudcampus.io` | `docs/INCIDENT_RUNBOOK.md` PB-4 | DevOps if active > 30 min |
| `AIBudgetBurnRateHigh` | warning | AI ops owner | Slack `#cloudcampus-ai-ops` | Email `ops@cloudcampus.io` | AI usage dashboard + budget config | AI owner -> customer success if tenant impact |
| `AIUsageFailureRateHigh` | warning | AI ops owner | Slack `#cloudcampus-ai-ops` | Email `ops@cloudcampus.io` | AI provider/prompt failure triage | AI owner -> backend lead if provider outage |

## Severity Rules

Critical means immediate production risk:

- Backend unavailable.
- Redis unavailable.
- DB connection pool near exhaustion.
- JVM heap near OOM.
- Backup freshness violates the recovery posture.

Warning means degraded service or operational risk:

- Elevated 5xx rate.
- Elevated p95 latency.
- Heap pressure before OOM risk.
- Queue backlog.
- Missing backup telemetry.
- Disk pressure.
- AI budget or failure anomaly.

Warnings can be promoted to critical manually when they affect a paid tenant,
block login/payment flows, or remain unresolved across two repeat intervals.

## Runbook Requirements

Every alert annotation should eventually include:

- `runbook_url`
- `owner`
- `service`
- `severity`
- `dashboard_url`

Near-term follow-up: add these annotations to
`infra/prometheus/alert_rules.yml` after production dashboard URLs are stable.

## Escalation Paths

| Severity | First responder | Escalation time | Escalation path |
|---|---|---:|---|
| P1 critical outage | Platform on-call | 15 minutes | Incident commander -> Engineering lead -> CTO -> customer success |
| P2 critical degradation | Service owner | 30 minutes | Service owner -> Engineering lead -> customer success if tenant-facing |
| P3 warning | Service owner | 1 business day | Service owner -> team lead |

Customer success sends tenant communications only after the incident commander
confirms tenant impact and message content.

## Validation Checklist

Before production enablement:

1. Alertmanager loads configuration successfully.
2. PagerDuty test alert reaches the platform service.
3. Slack test alerts reach `#cloudcampus-alerts`, `#cloudcampus-ai-ops`, and
   `#cloudcampus-release-ops`.
4. Email fallback sends through a real SMTP relay, not `localhost:25`.
5. `BackendDown`, `RedisDown`, and `BackupNotFresh` test alerts page on-call.
6. Warning test alerts do not page unless manually promoted.
7. Resolved notifications are visible for critical alerts.
8. Every current Prometheus alert has an owner, route, runbook, and escalation
   row in this plan.

## Rollback

If a production Alertmanager route is noisy or misconfigured:

1. Keep Prometheus alert evaluation enabled.
2. Revert only the receiver or route causing bad delivery.
3. Fall back to `ops-email` temporarily.
4. Record the rollback reason and open a follow-up to restore PagerDuty/Slack
   routing before the next release gate.
