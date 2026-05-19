# Queue Stress Test Plan

Last updated: 2026-05-19

## Scope

This plan defines how to stress the CloudCampus RabbitMQ notification queues before a production release. It focuses on queue throughput, retry and dead-letter behavior, backlog alerts, and consumer scaling.

Current implemented RabbitMQ notification topology:

| Exchange | Routing key | Queue | Dead-letter route |
|---|---|---|---|
| `cc.notifications` | `notification.email` | `cc.notifications.email` | `cc.notifications.dlx` to `cc.notifications.dead` |
| `cc.notifications` | `notification.sms` | `cc.notifications.sms` | `cc.notifications.dlx` to `cc.notifications.dead` |

Future channels already described in architecture docs, such as push or WhatsApp queues, must be added to this plan when they are wired through RabbitMQ.

## Preconditions

1. Seeded staging is running with production-like PostgreSQL, Redis, RabbitMQ, SMTP/MailHog or a provider sandbox, and Prometheus.
2. RabbitMQ management API is reachable from the test runner.
3. Backend uses manual acknowledgements, publisher confirms, durable queues, `prefetch=10`, listener `concurrency=1`, and `max-concurrency=3`.
4. The `RabbitMQQueueDepthHigh` alert is loaded in Prometheus and visible in Alertmanager.
5. Test tenants include at least one school with parent-linked students so attendance absence alerts can publish real email notification messages.

## Test Data

| Dataset | Volume | Purpose |
|---|---:|---|
| Small | 1 tenant, 1 school, 250 parent recipients | Smoke queue topology and DLX behavior. |
| Standard | 3 tenants, 6 schools, 5,000 parent recipients | Release gate for ordinary production readiness. |
| Burst | 3 tenants, 6 schools, 25,000 notification messages in 10 minutes | Backlog, alert, and consumer scaling proof. |

All generated messages must include a unique correlation or message identifier so duplicates can be measured through `notification_logs` and RabbitMQ message metadata.

## Scenarios

| Scenario | Setup | Expected result |
|---|---|---|
| Baseline publish and drain | Publish 1,000 email messages to `notification.email` at 50 messages/sec. | `cc.notifications.email` drains to near zero within 5 minutes; no messages land in `cc.notifications.dead`; notification logs show matching `SENT` or provider-sandbox outcomes. |
| Sustained notification load | Publish Standard dataset traffic for 30 minutes with normal consumers. | Queue depth remains bounded; p95 publish latency stays below 250 ms; no sustained backlog after producers stop. |
| Burst backlog | Publish Burst dataset traffic faster than consumers can drain. | `RabbitMQQueueDepthHigh` fires when queue depth remains above threshold; backlog drains after producers stop or consumers scale. |
| Downstream provider outage | Point SMTP/provider sandbox to fail or block delivery, then publish 100 messages. | Consumer handles provider failures without crashing; current email implementation records `FAILED` notification logs. If listener exceptions are forced, messages route to `cc.notifications.dead`. |
| Poison message | Publish malformed JSON or an unsupported payload directly to the queue. | Consumer rejects the message and it appears in `cc.notifications.dead`; normal messages behind it continue draining. |
| DLX inspection and manual retry | Inspect `cc.notifications.dead`, capture sample payloads, replay a known-good payload to `cc.notifications`. | Dead-letter payloads are inspectable; replayed message is processed once; original DLX message is removed only after investigation. |
| Broker restart during backlog | Build a backlog, restart RabbitMQ, then restart consumers if needed. | Durable queued messages survive broker restart; consumer reconnection resumes draining; in-flight loss, if any, is documented from notification logs. |
| Consumer scaling | Run sustained load with one backend instance, then scale consumers horizontally. | Drain rate increases roughly with active consumer count until provider or DB writes become the bottleneck. |

## Retry and Dead-Letter Expectations

Current behavior:

1. Publishers use RabbitMQ publisher confirms and mandatory returns.
2. Email and SMS queues are durable and DLX-backed.
3. Listeners use manual ack.
4. On explicit listener exception, the consumer `basicNack`s with `requeue=false`, which routes the message to `cc.notifications.dead`.
5. Provider-level email/SMS failures are recorded in `notification_logs`; they do not automatically requeue because the dispatch service catches provider exceptions.

Validation expectations:

| Behavior | Gate |
|---|---|
| Unroutable publish | Logged through RabbitTemplate returns callback. |
| Broker unavailable | Publisher fails open and logs the publish failure. |
| Listener exception | Message goes to `cc.notifications.dead`. |
| Provider failure | `notification_logs.status` records `FAILED` with a reason. |
| Manual retry | Operator can replay a dead-letter payload after correcting the cause. |

Future retry improvement to track: add a delayed retry exchange or retry queue with bounded attempts before DLX if provider outages should be retried automatically.

## Monitoring

Collect these metrics and screenshots during every queue stress run:

| Signal | Source | Gate |
|---|---|---|
| Queue depth | RabbitMQ `messages` per queue | No sustained growth after producers stop. |
| Ready vs unacked messages | RabbitMQ management API | Unacked count should stay bounded by consumer count times prefetch. |
| Consumer count | RabbitMQ management API | Non-zero for every active queue during the run. |
| Publish rate and deliver/ack rate | RabbitMQ management API | Deliver/ack rate catches up after bursts. |
| DLX depth | `cc.notifications.dead` | Zero in normal runs; expected count in poison-message run. |
| Notification outcomes | `notification_logs` | Sent/failed counts match provider test expectations. |
| Backend health | Prometheus JVM, DB pool, CPU, HTTP 5xx | No resource saturation after load stops. |
| Backlog alert | `RabbitMQQueueDepthHigh` | Fires during burst backlog and resolves after drain. |

RabbitMQ queue inspection:

```bash
curl -s -u "${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}" \
  "http://localhost:15672/api/queues/%2F/cc.notifications.email" \
  | jq '{name, messages, messages_ready, messages_unacknowledged, consumers, message_stats}'
```

Dead-letter inspection:

```bash
curl -s -u "${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}" \
  "http://localhost:15672/api/queues/%2F/cc.notifications.dead" \
  | jq '{name, messages, consumers}'
```

Alert validation:

```bash
curl -s "http://localhost:9090/api/v1/query?query=rabbitmq_queue_messages" | jq .
```

## Consumer Scaling Gates

| Stage | Action | Pass condition |
|---|---|---|
| Baseline | One backend instance, default listener settings. | Queue drains under Standard load. |
| Scale out | Add one backend instance at a time. | Consumer count increases and drain rate improves. |
| Provider bottleneck check | Continue adding consumers until drain rate stops improving. | Bottleneck is identified as provider, DB logging, broker CPU, or app CPU. |
| Scale back | Return to normal backend replica count. | Queue remains stable with normal traffic. |

Do not increase prefetch above 10 during release gating unless memory, downstream provider limits, and duplicate handling have been reviewed.

## Go/No-Go

| Requirement | Gate |
|---|---|
| Notification queues | `cc.notifications.email` and `cc.notifications.sms` are declared, durable, and bound to `cc.notifications`. |
| DLX | `cc.notifications.dead` receives poison messages and remains empty during normal traffic. |
| Backlog alerts | `RabbitMQQueueDepthHigh` fires during burst backlog and resolves after drain. |
| Retries/manual replay | Dead-letter payload can be replayed after investigation without duplicate customer-visible sends. |
| Consumer scaling | Additional backend consumers reduce drain time without causing provider throttling or DB saturation. |
| Recovery | PB-3 in `docs/INCIDENT_RUNBOOK.md` is sufficient for operators to inspect queues, scale consumers, and handle DLX messages. |

## Known Follow-Ups

1. Validate whether `RabbitMQQueueDepthHigh` queue label matching catches `cc.notifications.*` queue names in staging metrics.
2. Add a delayed retry exchange if provider failures should retry before reaching the dead-letter queue.
3. Extend RabbitMQ queue stress coverage when push notifications are routed through RabbitMQ instead of direct async service calls.
4. Add a repeatable publisher script once seeded staging credentials and sample recipient generation are finalized.

## Validation

TASK-030 validation command:

```bash
rg -n "RabbitMQ|queue stress|DLX|dead-letter" infra docs PRODUCTION_READY_ROADMAP.md
```
