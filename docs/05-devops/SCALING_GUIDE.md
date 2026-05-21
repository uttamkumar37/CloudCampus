# Scaling Guide

## App Layer
- Run stateless backend replicas behind a load balancer.
- Use Redis/Rabbit/Postgres as shared state services.
- Ensure scheduled jobs use ShedLock so only one replica runs a job.

## Data Layer
- Add read replicas only for read-heavy reports after query ownership and consistency requirements are understood.
- Partition or archive high-volume audit, notification, attendance, and analytics event tables as volume grows.

## Queue Layer
- Scale consumers independently for notification and experience analytics queues.
- Monitor dead-letter queue size.

## Frontend/Mobile
- Frontend is static and can be served from CDN/nginx.
- Mobile API traffic should use the same rate limits and tenant safety as web.
