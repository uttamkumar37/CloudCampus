# CloudCampus - Demo Credentials

> Last Updated: 2026-05-06
> Seed commands: python3 scripts/seed_demo.py, python3 scripts/seed_dashboard_data.py

## Scope

Two seed profiles are available:

- Minimal profile via `seed_demo.py`
- Comprehensive profile via `seed_dashboard_data.py` (Sunrise Academy)

## Tenant

| Field | Value |
|---|---|
| Tenant ID | cloudcampus-demo-school |
| Tenant Slug | cloudcampus-demo-school |
| X-Tenant-ID (schema) | school_cloudcampus_demo_school |
| Login URL (tenant users) | http://localhost:5173/login |
| Login URL (super admin) | http://localhost:5173/super-admin/login |

## Comprehensive Seed (Sunrise Academy)

| Field | Value |
|---|---|
| Tenant ID | sunrise-academy |
| X-Tenant-ID (schema) | school_sunrise-academy |
| Login URL (tenant users) | http://localhost:5173/login |
| Login URL (super admin) | http://localhost:5173/super-admin/login |

### Sunrise Accounts

| Role | Username | Password |
|---|---|---|
| SUPER_ADMIN | superadmin | SuperAdmin_Docker_2026! |
| SCHOOL_ADMIN | priya.sharma | Sunrise@2026! |
| TEACHER | sunita.aggarwal | Sunita@Teacher126! |
| STUDENT | aarav.sharma1 | Aarav@Student126! |

## Accounts

| Role | Username | Password |
|---|---|---|
| SUPER_ADMIN | superadmin | SuperAdmin_Docker_2026! |
| SCHOOL_ADMIN | ananya.principal | Admin@Demo2026! |
| TEACHER | rohit.verma | Teacher@Demo2026! |
| STUDENT | mira.patel | Student@Demo2026! |
| PARENT | sanjay.patel | Parent@Demo2026! |

## Seeded Business Data

- 1 class: Grade 7 (G7)
- 1 section: A
- 1 subject: Mathematics (MATH7)
- 1 teacher record: T-7001 / Rohit Verma
- 1 student record: ADM-7001 / Mira Patel
- 1 parent-student link: Sanjay Patel -> Mira Patel
- 1 timetable slot
- 1 homework assignment
- 1 exam + 1 exam result
- 1 attendance record
- 1 fee assignment + 1 payment

## Re-seeding Notes

- The script is designed to be idempotent where supported by APIs.
- Existing data is reused when duplicate creation is blocked by validation rules.
- To start from a clean slate, use a fresh database volume before running the seed.
- The comprehensive seed populates timetable, attendance, fees, payments, exams, exam results, and homework in bulk for dashboard demos.
