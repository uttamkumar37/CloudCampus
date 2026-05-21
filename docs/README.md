# CloudCampus Documentation

This `/docs` system is the permanent engineering, AI-agent, DevOps, QA, audit, and product reference for CloudCampus. It was generated from the current repository implementation on 2026-05-22.

## How To Use This System
- Start with `00-core/README.md`, `00-core/PROJECT_OVERVIEW.md`, and `00-core/DO_NOT_BREAK_RULES.md` before making code changes.
- For implementation changes, load only the matching module file under `10-modules/<module>/README.md`, the related API group under `11-apis/<group>/README.md`, and the architecture rule file for that layer.
- For production incidents, use `12-runbooks` first, then open backend/database/security docs as needed.
- For CI or release work, use `05-devops/CI_CD_PIPELINE.md`, `08-testing/TESTING_STRATEGY.md`, and `00-core/CONTRIBUTING.md`.

## Verified Source Inventory
- Backend packages detected: 36 (`ai, assignment, attendance, audit, auth, common, config, demo, domain, exam, experience, feature, finance, homework, leave, lessonplan, mobile, notice, notification, onlineclass...`).
- Backend controllers detected: 73.
- Backend service implementations detected: 48.
- Backend repositories detected: 85.
- Flyway migrations detected: 93 (`V1` through `V93`).
- Frontend feature folders detected: 22.
- Mobile source files detected outside node_modules: 13.
- GitHub workflows detected: `ci.yml, deploy.yml, docker-publish.yml, dr-drill.yml, openapi-publish.yml, security-nightly.yml`.

## Key Current Gaps From Analysis
- Transport and hostel are not standalone modules; they are logistics fields inside Student Profile 360.
- Mobile app is active again, but CI still does not run mobile validation. Add mobile typecheck/export to CI before treating mobile as release-blocking.
- Audit logging is not uniformly visible across every mutation. Treat audit coverage as mandatory for new writes.
- Several backend APIs exist outside the requested API documentation groups, including website builder, custom domain, subscription, staff, school setup, storage, reports, payments, and experience platform. They are covered through module docs and should be added to a full OpenAPI-derived API reference in a later documentation hardening pass.
