# CloudCampus

**AI-ready Multi-Tenant School ERP SaaS Platform**

[![Backend: Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](backend)
[![Frontend: React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=111827)](frontend)
[![Mobile: Expo](https://img.shields.io/badge/Mobile-Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](mobile)
[![Database: PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](docs/deployment)
[![CI: GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](.github/workflows)
[![Status: Staging Ready](https://img.shields.io/badge/Status-Staging%20Ready%20for%20Recreate-7C3AED?style=for-the-badge)](docs/audit/PRODUCTION_READINESS_REPORT.md)
[![License: TBD](https://img.shields.io/badge/License-TBD-64748B?style=for-the-badge)](#license)

CloudCampus is a modern School ERP SaaS platform built for schools, trusts, and multi-campus organizations. It is designed around a multi-tenant architecture, role-based access, secure onboarding, school isolation, and scalable ERP workflows for academic and administrative operations.

The platform supports Super Admin, Tenant Admin, School Admin, Teacher, Finance Staff, Parent, Student, and Staff experiences. Core capabilities include tenant onboarding, invitations, MFA-backed authentication, student import, staff provisioning, academic setup, attendance, homework, exams/results, fees/payments, notices, reports, documents, website content, audit logging, and an AI-ready foundation.

CloudCampus is currently **staging-ready for controlled deployment and internal demo use**. It is **not yet production-ready for paid customers**. Stable HTTPS staging, SMTP delivery, object storage, payment gateway integration, monitoring, backup/restore proof, and production hardening remain pending.

## Product Highlights

| Capability | Description |
|---|---|
| Multi-tenant SaaS architecture | Tenant and school hierarchy with server-derived access context |
| Super Admin control center | Platform onboarding, tenant visibility, subscriptions, audit and health foundation |
| Tenant Admin management | Multi-school organization management scaffold |
| School Admin ERP workflows | Students, parents, staff, academic setup, fees, attendance, homework, exams, notices, reports |
| Teacher portal | Assigned-class workflows for attendance, homework, exams, marks and notices |
| Parent portal | Child-linked access for attendance, homework, results, fees, notices and leave requests |
| Student portal | Own-profile scoped homework, results, attendance, notices and timetable foundation |
| Finance Staff portal | Fee demand, payment, receipt and finance report foundation |
| Secure onboarding | Super Admin protected tenant creation, first real school, School Admin invitation and access grant |
| Authentication and MFA | JWT sessions, refresh lifecycle, MFA challenge, BCrypt password hashing |
| Audit logging | Sensitive flows record audit metadata without raw secrets |
| Deployment-ready structure | Docker, Compose, Nginx, EC2 runbooks, health checks and rollback docs |
| AI-ready architecture | AI entitlement and knowledge retrieval foundation without exposing raw prompt data |

## Architecture Overview

```text
CloudCampus Platform
  -> Tenants
      -> Schools
          -> Users and Roles
              -> SUPER_ADMIN
              -> TENANT_ADMIN
              -> SCHOOL_ADMIN
              -> TEACHER
              -> FINANCE_STAFF
              -> STAFF
              -> PARENT
              -> STUDENT
          -> Academic Setup
          -> Students and Parents
          -> Staff and Teachers
          -> Attendance
          -> Homework
          -> Exams and Results
          -> Fees and Payments
          -> Notices
          -> Reports
          -> Documents
          -> Website Content
```

```text
React + Vite Frontend
  -> Shared API Client
  -> Role-based Portal Shell
  -> Protected Routes

Expo Mobile Shell
  -> Role-ready mobile structure
  -> Parent/student/teacher workflow foundation

Spring Boot Backend
  -> Spring Security + JWT + MFA
  -> Modular business domains
  -> Tenant and school access guards
  -> Flyway migrations
  -> Audit logging

PostgreSQL
  -> Tenant-scoped and school-scoped data
  -> Flyway-managed schema

Docker + Nginx
  -> Local/staging/prod compose assets
  -> Reverse proxy and health checks

GitHub Actions
  -> Backend, frontend, mobile, Docker and security validation workflows
```

## Role-Based Portal Overview

| Role | Purpose | Current Capability |
|---|---|---|
| `SUPER_ADMIN` | Platform owner and operator | Protected onboarding, platform summaries, tenant/school/subscription/audit/health foundations |
| `TENANT_ADMIN` | Organization-level school management | Multi-school admin scaffold and subscription/reporting foundation |
| `SCHOOL_ADMIN` | Full school ERP management | Strongest portal: student import, staff, academic setup, fees, attendance, homework, exams, notices, reports |
| `TEACHER` | Classroom operations | Assigned-class workflows and marks/homework/attendance foundation |
| `FINANCE_STAFF` | School finance operations | Fee demands, payments, receipts and finance summary foundation |
| `PARENT` | Child-linked family access | Child-scoped attendance, homework, results, fees, notices and leave foundation |
| `STUDENT` | Own academic access | Own homework, results, attendance, notices, timetable and profile foundation |
| `STAFF` | Non-teaching school staff | Authenticated staff role and portal shell foundation |

## Feature Matrix

| Module | Status | Notes |
|---|---|---|
| Authentication | Verified | Login, MFA challenge, JWT, refresh/logout, BCrypt password hashing |
| Tenant onboarding | Verified | Super Admin protected tenant, first school, School Admin invitation and audit rows |
| School access | Verified | User school access and active school context foundation |
| Student import | Verified | School-aware import UX with academic year, class and section selectors |
| Staff/teacher provisioning | Verified | School Admin provisioning and teacher/staff directory foundation |
| Academic setup | Verified | Academic years, classes, sections, subjects and teacher assignments |
| Attendance | Partial | API-backed foundation; production UX and reporting need polish |
| Homework | Partial | API-backed foundation; submissions/review UX needs deeper polish |
| Exams/results | Partial | Exam/result foundation and marks workflow; production-grade UX still evolving |
| Fees/payments | Partial | Fee demands, payments and receipts exist; payment gateway is pending |
| Notices | Partial | School/tenant targeted notice foundation exists |
| Reports | Partial | Export foundation exists; advanced report catalog and downloads need hardening |
| Documents | Partial | Document metadata foundation exists; object storage is pending |
| Website builder | Partial | Website content foundation exists; builder polish is pending |
| AI foundation | Partial | Entitlement/audit/retrieval foundation; advanced AI/RAG is planned |
| Deployment | Production hardening needed | EC2 HTTP staging smoke passed; HTTPS, monitoring, backups and managed services pending |

## Current Readiness Status

CloudCampus is currently **staging-ready for controlled deployment and internal demo use**. It is **not yet production-ready for paid customers**.

| Area | Status |
|---|---|
| Local development | Ready |
| Internal demo | Ready |
| EC2 HTTP staging smoke | Verified |
| Stable HTTPS staging | Pending |
| Pilot customer | Not ready |
| Paid production | Not ready |
| Enterprise production | Not ready |

## Staging Smoke Evidence

The latest controlled EC2 HTTP staging smoke verified:

- Backend health returned `UP`
- Readiness returned `UP`
- Frontend loaded successfully
- Super Admin login and MFA worked
- Tenant onboarding worked
- School Admin invitation was generated
- School Admin invitation acceptance and login worked
- Academic setup worked
- Student import worked
- Logout worked

No public IPs, secrets, tokens, or credentials are stored in this README.

## Tech Stack

### Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA / Hibernate
- Flyway
- PostgreSQL
- Maven

### Frontend

- React
- TypeScript
- Vite
- Tailwind-style utility CSS and custom design system styles
- Lucide Icons
- Recharts

### Mobile

- Expo
- React Native
- TypeScript

### Infrastructure

- Docker
- Docker Compose
- Nginx reverse proxy
- GitHub Actions
- EC2 staging deployment path

## Repository Structure

```text
backend/      Spring Boot backend, domain modules, Flyway migrations and tests
frontend/     React/Vite web app, public homepage, auth and role-based portals
mobile/       Expo mobile shell and role-ready mobile structure
infra/        Docker, Nginx, AWS/Terraform placeholders, monitoring and scripts
docs/         Architecture, audit, deployment, product and validation documents
scripts/      CI, ops, backup/restore and staging smoke helper scripts
.github/      GitHub Actions workflows and automation config
```

## Branch and Version Strategy

The active development and deployment line is:

```text
main
```

Backup restore points are preserved separately:

```text
backup/Version-V1
backup/Version-V2
```

Release/backup tags:

```text
Version-V1
Version-V2
```

`Version-V1` and `Version-V2` are backups only. Do not develop directly on backup branches. Use short-lived task branches for feature work and merge validated changes into `main`.

## Environment Strategy

Use the same code commit with different environment configuration:

| Environment | Purpose | Policy |
|---|---|---|
| Local | Developer machine | Demo data and local-only credentials allowed |
| Demo | Product showcase | Demo data allowed, no real customer data |
| Staging | Production-like verification | Test data only, production-shaped deployment |
| Production | Real customers | Real secrets, backups, monitoring and no demo credentials |

Avoid long-running `demo`, `staging`, or `production` branches unless a future release process explicitly requires them.

## Local Development Setup

### Prerequisites

- Java 21
- Node.js 20+
- Docker
- Docker Compose

### Backend

```bash
cd backend
mvn test
SPRING_PROFILES_ACTIVE=local mvn spring-boot:run
```

Backend health:

```text
http://127.0.0.1:8080/actuator/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend local URL:

```text
http://127.0.0.1:5173/
```

### Mobile

```bash
cd mobile
npm install
npm run typecheck
npm start
```

### Docker

```bash
docker compose --env-file .env.example -f docker-compose.local.yml up -d
```

Local demo users are seeded only for local/demo-style development. Do not copy local credentials into staging or production.

## Validation Commands

```bash
cd backend && mvn test
```

```bash
cd frontend && npm test -- --run
cd frontend && npm run lint
cd frontend && npm run typecheck
cd frontend && npm run build
```

```bash
cd mobile && npm run lint
cd mobile && npm run typecheck
cd mobile && npm test -- --run
```

```bash
sh scripts/ci/validate-ops.sh
sh scripts/ci/security-audit.sh
```

Compose validation:

```bash
docker compose --env-file .env.example -f docker-compose.local.yml config
docker compose --env-file .env.staging.example -f docker-compose.staging.yml config
docker compose --env-file .env.production.example -f docker-compose.prod.yml config
```

## Deployment

CloudCampus includes local and staging deployment assets:

- Local Docker Compose for development
- Staging Docker/EC2 path
- Nginx reverse proxy config
- Backend and frontend Dockerfiles
- Health/readiness endpoints
- Rollback and staging runbooks

Real staging should use HTTPS. Production requires managed database, strong secret management, backups, restore proof, monitoring, alerting, SMTP provider, object storage and payment provider configuration.

Deployment references:

- [Staging Runbook](docs/deployment/STAGING_RUNBOOK.md)
- [Staging Execution Guide](docs/deployment/STAGING_EXECUTION_GUIDE.md)
- [Staging Smoke Test Report](docs/audit/STAGING_SMOKE_TEST_REPORT.md)
- [Production Readiness Report](docs/audit/PRODUCTION_READINESS_REPORT.md)
- [Rollback Guide](docs/deployment/ROLLBACK_GUIDE.md)
- [Health Check Guide](docs/deployment/HEALTH_CHECK_GUIDE.md)

## Security

CloudCampus currently includes:

- JWT-based authentication
- MFA challenge foundation
- BCrypt password hashing
- Refresh token lifecycle and logout revocation
- Role-based access control
- Tenant isolation and school access checks
- Parent-child access foundation
- Teacher assignment access foundation
- Finance school access foundation
- Audit logging for sensitive operations
- Header spoofing protection for tenant/school context
- Production fail-fast validation for unsafe config

Never commit secrets. Use environment variables or a secret manager. Do not store JWT secrets, database passwords, SMTP credentials, invitation tokens, MFA codes, or payment provider keys in Git.

## Roadmap

### P0: Before Pilot

- Stable HTTPS staging
- Rotate staging secrets
- Disable bootstrap in shared staging
- SMTP invitation delivery
- Backup/restore proof
- Monitoring and alerts
- Continue improving student import and core School Admin UX

### P1: Before Paid Production

- Object storage
- Payment gateway
- Mobile auth and parent/student flows
- OpenAPI contract publication
- Pagination/filtering polish
- Production-grade School Admin UX

### P2: Enterprise Scale

- Advanced AI/RAG
- Enterprise SSO
- Analytics warehouse
- Custom website builder polish
- Deeper reporting and BI workflows

## Screenshots

Screenshots are planned but not yet committed.

![CloudCampus Homepage](docs/assets/homepage.png)
![Super Admin Dashboard](docs/assets/super-admin-dashboard.png)
![School Admin Portal](docs/assets/school-admin-portal.png)
![Parent Student Mobile Preview](docs/assets/mobile-preview.png)

Placeholder notes live in [docs/assets/README_SCREENSHOT_PLACEHOLDERS.md](docs/assets/README_SCREENSHOT_PLACEHOLDERS.md).

## Important Disclaimer

This project is under active development. It is suitable for local demos and controlled staging validation, but it is not yet ready for paid production customers.

## Contribution and Development Notes

- Follow task IDs from the [Master Architecture and Execution Plan](docs/CLOUDCAMPUS_MASTER_ARCHITECTURE_AND_EXECUTION_PLAN.md).
- Update docs after every major task.
- Do not bypass tenant or school security rules.
- Do not introduce fake UI data into authenticated production-facing portals.
- Keep backend, frontend, mobile and ops validation commands green.
- Prefer short-lived feature branches and merge validated work into `main`.

## License

License: TBD

