# Auth Strategy

## Status
Accepted

## Context
CloudCampus is a multi-tenant SaaS school ERP with strict tenant isolation, role-based access, audit requirements, and enterprise scaling goals.

## Decision
CloudCampus uses stateless JWT access tokens, refresh-token rotation, Redis-backed lockout/denylist/OTP support, BCrypt passwords, and Spring Security RBAC.

## Consequences
- Implementation must follow this architecture in code, tests, and documentation.
- Future changes that conflict with this ADR require a new ADR.
- AI agents must load this ADR before changing related behavior.
