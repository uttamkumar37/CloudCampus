# AI Architecture

## Status
Accepted

## Context
CloudCampus is a multi-tenant SaaS school ERP with strict tenant isolation, role-based access, audit requirements, and enterprise scaling goals.

## Decision
AI uses Spring AI, provider-specific model integrations, tenant-scoped knowledge/embeddings, usage logging, and Redis-backed rate limiting.

## Consequences
- Implementation must follow this architecture in code, tests, and documentation.
- Future changes that conflict with this ADR require a new ADR.
- AI agents must load this ADR before changing related behavior.
