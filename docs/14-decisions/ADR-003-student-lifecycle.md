# Student Lifecycle

## Status
Accepted

## Context
CloudCampus is a multi-tenant SaaS school ERP with strict tenant isolation, role-based access, audit requirements, and enterprise scaling goals.

## Decision
Student lifecycle events must preserve academic history and avoid overwriting historical records during promotion, suspension, transfer, or rejoin flows.

## Consequences
- Implementation must follow this architecture in code, tests, and documentation.
- Future changes that conflict with this ADR require a new ADR.
- AI agents must load this ADR before changing related behavior.
