# CloudCampus — Claude AI Development Instructions

## Project Overview

CloudCampus is a multi-tenant SaaS school management platform.

Architecture:

* Backend: Spring Boot 3 + Java 21
* Frontend: React + TypeScript + Vite
* Mobile: React Native
* Database: PostgreSQL
* Cache: Redis
* Storage: MinIO
* Monitoring: Prometheus + Grafana
* Email: MailHog (dev)
* Infrastructure: Docker Compose
* Authentication: JWT-based
* Multi-tenancy: tenant-aware architecture

---

# Core Engineering Principles

## 1. Never break existing functionality

Before modifying:

* inspect dependencies
* inspect related services
* inspect frontend/backend integration
* inspect tenant isolation
* inspect RBAC/security impact

Always preserve backward compatibility unless explicitly instructed.

---

## 2. Multi-tenant safety is critical

Every tenant must remain isolated.

Always verify:

* tenantId propagation
* repository filtering
* JWT tenant claims
* role isolation
* school isolation
* query scoping

Never expose cross-tenant data.

---

## 3. Security-first development

Always preserve:

* JWT validation
* password hashing
* audit logging
* RBAC checks
* rate limiting
* input validation
* tenant validation
* permission checks

Never bypass authentication/security.

---

## 4. Production-grade code only

Avoid:

* temporary hacks
* duplicate logic
* hardcoded secrets
* unstructured services
* weak validation
* poor naming
* unoptimized queries

Prefer:

* clean architecture
* SOLID principles
* reusable components
* DTO separation
* service abstraction
* proper transaction handling

---

# Project Structure

## Backend

```text
backend/
```

Tech stack:

* Spring Boot 3
* Java 21
* Maven
* PostgreSQL
* Redis
* Flyway
* JWT

---

## Frontend

```text
frontend/
```

Tech stack:

* React
* TypeScript
* Vite
* Zustand
* React Query

---

## Mobile

```text
mobile/
```

Tech stack:

* React Native
* Offline sync
* Shared auth contracts

---

## Infrastructure

```text
infra/
```

Contains:

* Docker
* Prometheus
* Grafana
* load testing
* backups
* observability

---

# Required Workflow Before Coding

## ALWAYS perform architecture analysis first

Before implementing features:

```bash
graphify query "how <feature> works"
```

Examples:

```bash
graphify query "how authentication works"
graphify query "how attendance works"
graphify query "how fee management works"
graphify query "how tenant isolation works"
```

---

# Graphify Commands

## Full extraction

```bash
graphify extract . --backend gemini --max-concurrency 2
```

---

## Incremental update

```bash
graphify update .
```

---

## Watch mode

```bash
graphify watch .
```

---

## Generate architecture tree

```bash
graphify tree
```

Open:

```bash
open graphify-out/GRAPH_TREE.html
```

---

## Generate call-flow diagrams

```bash
graphify export callflow-html
```

Open:

```bash
open graphify-out/CloudCampus-callflow.html
```

---

## Explain architecture node

```bash
graphify explain "JwtUtil"
```

---

## Find dependency path

```bash
graphify path "LoginPage()" "JwtUtil"
```

---

# Required Workflow After Coding

After ANY architecture/code changes:

```bash
graphify update .
```

After major feature/module changes:

```bash
graphify export callflow-html
graphify tree
```

---

# Backend Development Rules

## Controllers

Controllers should:

* remain thin
* validate requests
* delegate to services
* never contain business logic

---

## Services

Services should:

* contain business logic
* enforce tenant isolation
* enforce RBAC
* remain modular
* use transactions properly

---

## Repositories

Repositories must:

* scope tenant data properly
* avoid N+1 queries
* use indexes efficiently
* support soft delete

---

## DTOs

Never expose entities directly.

Use:

* request DTOs
* response DTOs
* mapper layer if needed

---

## Security

Always validate:

* JWT
* roles
* tenant access
* school ownership
* permissions

---

## Logging

Security-sensitive operations must:

* create audit logs
* include actor/user info
* include tenant context
* avoid secret leakage

---

# Frontend Development Rules

## Avoid infinite API loops

Never write:

```tsx
useEffect(() => {
  apiCall()
})
```

Always include dependencies.

---

## React Query

For login/auth mutations:

```tsx
retry: false
```

Avoid auth retry loops.

---

## State Management

Use Zustand stores cleanly.

Avoid:

* duplicated state
* stale auth state
* circular updates

---

## API Layer

Keep API calls centralized:

```text
features/*/api/
```

---

## RBAC UI

Frontend must respect:

* permissions
* roles
* tenant restrictions
* school restrictions

Never expose unauthorized UI.

---

# Mobile Development Rules

Maintain compatibility with:

* backend contracts
* auth flow
* offline sync
* shared DTOs

Avoid diverging schemas.

---

# Database Rules

## Use Flyway migrations only

Never manually modify schema.

---

## Preserve tenant isolation

Every tenant-scoped table should:

* include tenant_id
* filter correctly
* index correctly

---

## Avoid destructive migrations

Prefer:

* additive migrations
* safe transformations
* rollback-safe operations

---

# Docker Rules

Infrastructure services run in Docker:

```text
postgres
redis
minio
mailhog
grafana
prometheus
```

Backend/frontend run locally during development.

---

# Authentication Rules

Current auth stack:

* JWT access tokens
* refresh tokens
* rate limiting
* audit logging
* password reset
* tenant-aware auth

Never weaken auth/security.

---

# Rate Limiting

Development environments may temporarily relax limits.

Production must always enforce:

* login protection
* brute-force prevention
* abuse prevention

---

# Audit Logging

Critical actions must create audit events:

* login
* logout
* password changes
* tenant changes
* RBAC changes
* fee operations
* attendance operations

---

# Architecture Analysis Guidelines

Before refactoring:

```bash
graphify path "A" "B"
```

Before implementing:

```bash
graphify query "how <module> works"
```

After major changes:

```bash
graphify export callflow-html
graphify tree
```

---

# Recommended Daily Workflow

## Start day

```bash
graphify watch .
```

---

## Before coding

```bash
graphify query "how <feature> works"
```

---

## After coding

```bash
graphify update .
```

---

## End of day

```bash
graphify export callflow-html
graphify tree
```

Commit updated graph outputs.

---

# Git Rules

Commit important architecture outputs:

```text
graphify-out/graph.json
graphify-out/GRAPH_TREE.html
graphify-out/CloudCampus-callflow.html
```

Do not commit:

```text
.graphify_cache/
```

---

# Current Local Development URLs

Backend:

```text
http://localhost:8080
```

Frontend:

```text
http://localhost:5173
```

MinIO:

```text
http://localhost:9001
```

Grafana:

```text
http://localhost:3100
```

Prometheus:

```text
http://localhost:9090
```

MailHog:

```text
http://localhost:8025
```

---

# Important CloudCampus Modules

Core systems:

* Authentication
* RBAC
* Tenant Management
* School Management
* Student Lifecycle
* Attendance
* Fee Management
* Notifications
* Audit Logging
* Feature Flags
* Observability
* Reporting
* Parent/Guardian Links
* Mobile Sync

---

# AI Agent Expectations

Claude should:

* inspect architecture before changes
* avoid hallucinating APIs
* preserve module boundaries
* preserve tenant isolation
* preserve RBAC
* update Graphify outputs after changes
* maintain production-grade code quality

---

# Current Graph Stats

CloudCampus currently contains:

* ~1791 graph nodes
* ~4013 graph edges
* ~150 architecture communities

This is already a large SaaS-scale architecture.
