# Scheduler Flow

## Scheduled Jobs Detected
- `DataRetentionService`: daily UTC data purge according to retention policy.
- `FeeReminderScheduler`: daily UTC fee reminder processing.
- `DemoResetScheduler`: daily demo reset.
- `DemoOrchestrationService`: fixed-delay demo orchestration cleanup/maintenance.
- `AiUsageMetricsPublisher`: fixed-delay AI usage metrics refresh.

## Cluster Safety
`ShedLockConfig` exists because scheduled jobs must not run concurrently in every pod after horizontal scaling.

## Rules
- Every scheduled job must be idempotent.
- Jobs that mutate tenant data must log audit events.
- Jobs must be safe to retry after partial failure.
- Long-running jobs need pagination and backpressure.
