# Architecture Overview

## System Shape

CampusCloud uses a monorepo with two deployable applications:

- Backend: Spring Boot modular monolith with schema-per-tenant isolation
- Frontend: React + Vite SPA with feature-based modules

## Backend

Path: backend/

Key characteristics:

- Java 17, Spring Boot 3, Spring Security 6
- PostgreSQL with Flyway migrations
- JWT authentication
- Role-based authorization
- Schema-per-tenant multi-tenancy resolved from X-Tenant-ID header

High-level flow:

1. Request includes X-Tenant-ID and optional Authorization bearer token.
2. Tenant filter resolves tenant schema into request context.
3. JWT filter validates token and sets security context.
4. Controller -> Service -> Repository executes in tenant schema.

## Frontend

Path: frontend/

Key characteristics:

- React + TypeScript + Vite
- Feature-based folder organization
- Axios client with request interceptors
- TanStack Query for server-state management

Request behavior:

- Base API URL: http://localhost:8080/api/v1
- Sends Authorization header when token exists
- Sends X-Tenant-ID header when tenant exists

## Local Environments

- Local dev: run backend and frontend separately
- Container dev: docker-compose runs postgres, backend, and frontend
