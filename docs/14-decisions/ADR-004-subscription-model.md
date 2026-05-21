# Subscription Model

## Status
Accepted

## Context
CloudCampus is a multi-tenant SaaS school ERP with strict tenant isolation, role-based access, audit requirements, and enterprise scaling goals.

## Decision
Tenant subscriptions and feature flags control entitlements, with Redis cache for feature lookups and backend enforcement before protected feature use.

## Consequences
- Implementation must follow this architecture in code, tests, and documentation.
- Future changes that conflict with this ADR require a new ADR.
- AI agents must load this ADR before changing related behavior.
