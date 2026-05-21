# Docker Guide

## Local Infra
```bash
docker compose up -d
docker compose ps
docker compose logs -f postgres redis rabbitmq minio
```

## Backend Image
`backend/Dockerfile` builds the Spring Boot application image. Docker publish packages the JAR with `mvn package -DskipTests` because CI is expected to have already run tests.

## Frontend Image
`frontend/Dockerfile` builds the Vite static app and serves it with nginx, including SPA fallback for client routes.

## Rules
- Do not expose local infra ports publicly; compose binds services to `127.0.0.1`.
- Keep image tags immutable with sha tags; use `latest` only for main deployment convenience.
- Run Trivy before promoting images.
