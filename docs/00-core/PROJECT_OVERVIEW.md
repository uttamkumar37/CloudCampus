# Project Overview

CloudCampus is a multi-tenant school ERP and experience platform. The codebase contains a Spring Boot backend, Vite React frontend, Expo mobile app, PostgreSQL/Flyway database, Redis cache/rate-limit layer, RabbitMQ queues, MinIO object storage, and observability infrastructure.

## Product Areas Detected
- Tenant and school administration.
- Academic setup: academic years, classes, sections, subjects, departments, settings.
- Student lifecycle: admission, profile, documents, parent links, promotion, attendance, fees, results, Profile 360.
- Staff and teacher workflows: staff profiles, attendance, leave, teacher dashboard, homework, assignments, timetable, lesson plans, online classes, videos.
- Finance: fee structures, records, payments, invoices, Razorpay order/verify/webhook.
- Notifications: push, email/SMS queueing, WhatsApp logs, device tokens.
- AI: prompt templates, copilot, knowledge base, embeddings, usage logs, rate limiting.
- Website and experience platform: school website builder, custom domains, public site, public experience routes, investor rooms, analytics events.
- Reporting and analytics: school reports, tenant analytics, public experience analytics.

## Implementation Snapshot
- Backend: Java 21, Spring Boot 3.5.14, Spring Security, JPA, Flyway, Testcontainers, Spring AI, pgvector, RabbitMQ, Redis, MinIO, Razorpay, Micrometer/OpenTelemetry.
- Frontend: React 19, Vite, TypeScript, React Router 7, React Query, Zustand, Zod, Tailwind via Vite plugin.
- Mobile: Expo 52 / React Native 0.76 with secure session storage and Axios token refresh.
- Database: PostgreSQL 16 with pgvector extension and Flyway migrations `V10__create_device_tokens.sql` to `V9__soft_delete.sql`.

## Analysis Findings
- Standalone `transport` and `hostel` packages are absent; logistics data exists in `student/profile`.
- Backend route security is centralized in `SecurityConfig`, with method-level `@PreAuthorize` on many controllers.
- Tenant ownership is mostly enforced by tenant-scoped repositories and `RequestContext`/Hibernate filtering.
- CI runs backend `mvn verify`, frontend `npm run build`, and secret scan. OWASP Dependency Check and Trivy run in `security-nightly.yml` as a PR-triggered release gate that blocks CVSS >= 7 dependency findings and HIGH/CRITICAL backend-image findings.
- Docker publish is a separate workflow for `main`, `release/**`, tags, or manual dispatch; it assumes CI passed through branch protection.
