# Multi-Tenant Strategy

## Status
Accepted

## Context
CloudCampus is a multi-tenant SaaS school ERP with strict tenant isolation, role-based access, audit requirements, and enterprise scaling goals.

## Decision
CloudCampus uses shared application/database schema with tenant-owned records carrying `tenantId`, JWT-derived request context, tenant-scoped repository methods, and tenant-aware caches.

## Consequences
- Implementation must follow this architecture in code, tests, and documentation.
- Future changes that conflict with this ADR require a new ADR.
- AI agents must load this ADR before changing related behavior.
