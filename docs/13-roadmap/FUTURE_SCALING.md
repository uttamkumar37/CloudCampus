# Future Scaling

## Application
- Horizontal backend replicas with ShedLock for schedulers.
- Separate worker deployment for queue consumers if notification/analytics load grows.

## Data
- Composite tenant indexes on large tables.
- Partition high-volume logs/events.
- Read replicas for reporting after consistency rules are clear.

## Product
- Dedicated transport and hostel bounded contexts.
- More granular subscription metering.
- AI governance, prompt versioning, and cost controls.
- Offline mobile support with encrypted cache and conflict-safe queues.
