# CloudCampus — Platform Blueprint


> Version: 1.2 | Last Updated: 2026-05-07

This document explains how CloudCampus works from the perspective of each user role, covering workflows, access boundaries, and system capabilities.

---

## 0. Website CMS + Builder Extension (Multi-Tenant, Dynamic)

This extension adds a fully dynamic tenant website CMS/builder to CloudCampus.

### 0.1 Goals

- Every tenant can have a unique public website.
- SUPER_ADMIN can configure content, branding, media, section visibility, and ordering per tenant.
- No tenant-specific hardcoding in backend or frontend.
- All read/write operations remain tenant-isolated via schema and `X-Tenant-Slug`.

### 0.2 Dynamic Section Catalog

Default section keys supported by builder:

- `HOME`
- `ABOUT_US`
- `ACADEMICS`
- `ADMISSIONS`
- `FACILITIES`
- `GALLERY`
- `EVENTS_NEWS`
- `CONTACT_US`

Each section is:

- enable/disable capable
- display-order driven
- content-key driven (text, image, json, video URL)

### 0.3 SQL Schema (Tenant-Safe, Dynamic)

```sql
-- 1) Website-level branding/config
create table if not exists tenant_website_config (
      id uuid primary key default gen_random_uuid(),
      tenant_id varchar(100) not null,
      school_name varchar(200) not null,
      logo_url text,
      primary_color varchar(20),
      tagline varchar(255),
      meta_title varchar(255),
      meta_description text,
      og_image_url text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (tenant_id)
);

-- 2) Section toggle + ordering
create table if not exists website_sections (
      id uuid primary key default gen_random_uuid(),
      tenant_id varchar(100) not null,
      section_name varchar(80) not null,
      is_enabled boolean not null default true,
      display_order integer not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (tenant_id, section_name)
);

-- 3) Key-value content (text/image/json)
create table if not exists website_content (
      id uuid primary key default gen_random_uuid(),
      tenant_id varchar(100) not null,
      section_name varchar(80) not null,
      content_key varchar(120) not null,
      content_value text not null,
      type varchar(20) not null check (type in ('TEXT', 'IMAGE', 'JSON', 'VIDEO')),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (tenant_id, section_name, content_key)
);

-- 4) Media repository
create table if not exists website_media (
      id uuid primary key default gen_random_uuid(),
      tenant_id varchar(100) not null,
      media_type varchar(30) not null check (media_type in ('BANNER', 'GALLERY', 'CAMPUS', 'EVENT')),
      url text not null,
      alt_text varchar(255),
      display_order integer not null default 0,
      created_at timestamptz not null default now()
);

-- 5) Dynamic admissions leads
create table if not exists admission_leads (
      id uuid primary key default gen_random_uuid(),
      tenant_id varchar(100) not null,
      student_name varchar(120) not null,
      parent_name varchar(120) not null,
      phone varchar(30) not null,
      email varchar(160),
      class_applied varchar(80) not null,
      status varchar(20) not null default 'NEW' check (status in ('NEW', 'CONTACTED', 'CONVERTED')),
      source varchar(40) default 'WEBSITE',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
);

-- 6) Multi-campus model
create table if not exists tenant_campuses (
      id uuid primary key default gen_random_uuid(),
      tenant_id varchar(100) not null,
      campus_name varchar(150) not null,
      address_line_1 varchar(255) not null,
      address_line_2 varchar(255),
      city varchar(100),
      state varchar(100),
      postal_code varchar(20),
      contact_phone varchar(30),
      contact_email varchar(160),
      map_embed_url text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
);

create table if not exists tenant_campus_media (
      id uuid primary key default gen_random_uuid(),
      tenant_id varchar(100) not null,
      campus_id uuid not null references tenant_campuses(id) on delete cascade,
      url text not null,
      display_order integer not null default 0,
      created_at timestamptz not null default now()
);

-- 7) Dynamic form field definition for admission builder
create table if not exists admission_form_fields (
      id uuid primary key default gen_random_uuid(),
      tenant_id varchar(100) not null,
      field_key varchar(80) not null,
      label varchar(120) not null,
      field_type varchar(20) not null check (field_type in ('TEXT', 'EMAIL', 'PHONE', 'SELECT', 'NUMBER', 'DATE')),
      is_required boolean not null default true,
      options_json text,
      display_order integer not null default 0,
      is_enabled boolean not null default true,
      unique (tenant_id, field_key)
);
```

### 0.4 Spring Boot API Design

Write APIs accessible by **SCHOOL_ADMIN** (for their own school) and SUPER_ADMIN (platform-wide). All reads for public site: unauthenticated, tenant-scoped.

Admin APIs (managed by SUPER_ADMIN):

- `PUT /api/v1/website/config`
- `GET /api/v1/website/config`
- `PUT /api/v1/website/sections` (bulk reorder/toggle payload)
- `POST /api/v1/website/content`
- `PUT /api/v1/website/content/{id}`
- `DELETE /api/v1/website/content/{id}`
- `POST /api/v1/website/media`
- `DELETE /api/v1/website/media/{id}`
- `POST /api/v1/website/campuses`
- `PUT /api/v1/website/campuses/{id}`
- `DELETE /api/v1/website/campuses/{id}`
- `POST /api/v1/website/admission-form/fields`
- `PUT /api/v1/website/admission-form/fields/{id}`
- `DELETE /api/v1/website/admission-form/fields/{id}`
- `GET /api/v1/website/admission-leads`
- `PATCH /api/v1/website/admission-leads/{id}/status`

Public tenant website APIs:

- `GET /api/v1/public/website`
- `GET /api/v1/public/website/admission-form`
- `POST /api/v1/public/website/admission-leads`

Multi-tenancy rule:

- Internal/admin calls use `X-Tenant-Slug`.
- Public site can resolve tenant by subdomain, then internally map to tenant slug/schema.
- Never query data without tenant context set.

### 0.5 React Component Structure (Dynamic Rendering)

```text
src/
   features/website/
      api/
         websiteApi.ts
      components/
         TenantWebsitePage.tsx
         DynamicSectionRenderer.tsx
         sections/
            HomeSection.tsx
            AboutSection.tsx
            AcademicsSection.tsx
            AdmissionsSection.tsx
            FacilitiesSection.tsx
            GallerySection.tsx
            EventsNewsSection.tsx
            ContactSection.tsx
         media/
            BannerCarousel.tsx
            GalleryGrid.tsx
         admission/
            DynamicAdmissionForm.tsx
      hooks/
         useTenantWebsite.ts
         useAdmissionForm.ts
         useSubmitAdmissionLead.ts

   features/super-admin/website-builder/
      pages/
         WebsiteBuilderPage.tsx
      components/
         WebsiteConfigForm.tsx
         SectionManager.tsx
         SectionOrderDnD.tsx
         ContentEditor.tsx
         MediaManager.tsx
         CampusManager.tsx
         AdmissionFormBuilder.tsx
         AdmissionLeadsTable.tsx
```

Rendering flow:

1. Detect tenant via subdomain.
2. Fetch `GET /api/v1/public/website`.
3. Sort sections by `displayOrder`.
4. Render enabled sections through `DynamicSectionRenderer`.
5. Admission form fields loaded from dynamic form config.

### 0.6 Sample Public Website Response (Frontend Contract)

```json
{
   "success": true,
   "message": "Website payload fetched",
   "data": {
      "tenant": {
         "tenantId": "dps-bangalore",
         "schoolName": "DPS Bangalore South",
         "logoUrl": "https://cdn.cloudcampus.com/dps/logo.png",
         "primaryColor": "#0B5ED7",
         "tagline": "Excellence in Education",
         "seo": {
            "metaTitle": "DPS Bangalore South | CloudCampus",
            "metaDescription": "Admissions open for 2026-27.",
            "ogImageUrl": "https://cdn.cloudcampus.com/dps/og.jpg"
         }
      },
      "sections": [
         {
            "sectionName": "HOME",
            "enabled": true,
            "displayOrder": 1,
            "content": {
               "heroTitle": "Welcome to DPS Bangalore South",
               "heroSubtitle": "A future-ready campus for every learner"
            },
            "media": {
               "banners": [
                  "https://cdn.cloudcampus.com/dps/banner-1.jpg",
                  "https://cdn.cloudcampus.com/dps/banner-2.jpg"
               ]
            }
         },
         {
            "sectionName": "ABOUT_US",
            "enabled": true,
            "displayOrder": 2,
            "content": {
               "vision": "To shape responsible global citizens",
               "mission": "Provide holistic and inclusive education"
            }
         }
      ],
      "campuses": [
         {
            "campusName": "Main Campus",
            "address": "Kanakapura Road, Bangalore",
            "contactPhone": "+91-9000000000",
            "contactEmail": "info@dpsbengaluru.edu"
         }
      ],
      "admissionForm": {
         "fields": [
            { "fieldKey": "student_name", "label": "Student Name", "fieldType": "TEXT", "required": true },
            { "fieldKey": "parent_name", "label": "Parent Name", "fieldType": "TEXT", "required": true },
            { "fieldKey": "class_applied", "label": "Class Applying For", "fieldType": "SELECT", "required": true },
            { "fieldKey": "phone", "label": "Phone", "fieldType": "PHONE", "required": true },
            { "fieldKey": "email", "label": "Email", "fieldType": "EMAIL", "required": true }
         ]
      }
   }
}
```

### 0.7 Backend + Frontend Folder Additions

```text
backend/src/main/java/com/cloudcampus/
   website/
      controller/
      dto/
      entity/
      repository/
      service/
      mapper/

backend/src/main/resources/db/migration/
   V8__create_website_cms_tables.sql

frontend/src/features/
   website/
   super-admin/website-builder/
```

### 0.8 Design/UX Requirements

- Mobile-first responsive layouts.
- Hero image heavy homepage with tenant-driven banner slider.
- Clear typography scales and section spacing tokens.
- Palette and CTA styles derived from tenant `primaryColor`.

---

## Table of Contents

0. [Website CMS + Builder Extension](#0-website-cms--builder-extension-multi-tenant-dynamic)
1. [What is a Tenant?](#1-what-is-a-tenant)
2. [Tenant Onboarding Flow](#2-tenant-onboarding-flow)
3. [Role Definitions & Permissions](#3-role-definitions--permissions)
4. [Super Admin Workflows](#4-super-admin-workflows)
5. [School Admin Workflows](#5-school-admin-workflows)
6. [Teacher Workflows](#6-teacher-workflows)
7. [Student Workflows](#7-student-workflows)
8. [Parent Workflows](#8-parent-workflows)
9. [Fee Payment Flow](#9-fee-payment-flow)
10. [Timetable System](#10-timetable-system)
11. [Bulk Upload System](#11-bulk-upload-system)
12. [Subscription & Billing System](#12-subscription--billing-system)

---

## 1. What is a Tenant?

A **tenant** is an individual school registered on the CloudCampus platform. Each tenant:

- Has a **unique schema** in the PostgreSQL database (complete data isolation)
- Has a **unique `tenantId`** (business identifier, e.g., `greenwood`)
- Has a **schema name** (used as the `X-Tenant-Slug` header in API requests)
- Has customizable **branding** (school name, logo, primary color)
- Is completely isolated — no data is shared between tenants

All API requests targeting a specific school must include the `X-Tenant-Slug` header set to that school's schema name.

---

## 2. Tenant Onboarding Flow

### Step-by-Step: Creating a New School Tenant

**Prerequisite:** You must be authenticated as `SUPER_ADMIN`.

```
Step 1: Log in as Super Admin
────────────────────────────────
POST /api/v1/auth/login
Body: { "username": "superadmin", "password": "<bootstrap_password>" }
→ Receive JWT token

Step 2: Create the tenant
────────────────────────────────
POST /api/v1/tenants
Authorization: Bearer <token>
Body:
{
  "tenantId":    "greenwood",
  "schoolName":  "Greenwood High School",
  "schemaName":  "greenwood",
  "logoUrl":     "https://example.com/logo.png",
  "primaryColor": "#10b981",
  "schoolAdminFullName": "Sarah Admin",
  "schoolAdminUsername": "sarah.admin",
  "schoolAdminEmail": "sarah@greenwood.edu",
  "schoolAdminPhone": "9000000001",
  "schoolAdminPassword": "SecurePass123!"
}
→ Schema "greenwood" created
→ All 13 domain tables provisioned automatically
→ School Admin account provisioned from tenant payload

Step 3: School Admin logs in
────────────────────────────────
POST /api/v1/auth/login
X-Tenant-Slug: greenwood
Body: { "username": "sarah.admin", "password": "SecurePass123!" }
→ School is ready for use
```

### What Gets Created Automatically

When a new tenant is provisioned, the following are created in the new schema:

| Table | Purpose |
|-------|---------|
| `users` | Staff accounts |
| `students` | Student records |
| `teachers` | Teacher records |
| `classes` | Class levels |
| `subjects` | Academic subjects |
| `sections` | Class sections |
| `attendance_records` | Daily attendance |
| `fee_assignments` | Fee assignments |
| `fee_payments` | Payment records |
| `exams` | Scheduled exams |
| `exam_results` | Student results |
| `homework_assignments` | Homework tasks |
| `timetable_slots` | Weekly schedule |
| `parent_students` | Parent-child links |

---

## 3. Role Definitions & Permissions

### Role Overview

| Role | Scope | Description |
|------|-------|-------------|
| `SUPER_ADMIN` | Platform-wide | Manages all tenants and platform settings. Not bound to a specific school. |
| `SCHOOL_ADMIN` | Tenant-scoped | Manages all operations within one school. |
| `TEACHER` | Tenant-scoped | Manages students, attendance, exams, and homework within the school. |
| `STUDENT` | Tenant-scoped | Read-only access to own academic data, homework, and timetable. |
| `PARENT` | Tenant-scoped | Views linked children's data, fee status, and academic progress. |

### Detailed Permission Matrix

| Feature | SUPER_ADMIN | SCHOOL_ADMIN | TEACHER | STUDENT | PARENT |
|---------|:-----------:|:------------:|:-------:|:-------:|:------:|
| Create tenant | ✅ | — | — | — | — |
| View all tenants | ✅ | — | — | — | — |
| Activate / deactivate tenant | ✅ | — | — | — | — |
| Create users | ✅ | ✅ | — | — | — |
| View users | ✅ | ✅ | — | — | — |
| Enroll students | ✅ | ✅ | — | — | — |
| View students | ✅ | ✅ | ✅ | — | — |
| Create teachers | ✅ | ✅ | — | — | — |
| View teachers | ✅ | ✅ | ✅ | — | — |
| Manage classes/subjects/sections | ✅ | ✅ | — | — | — |
| View classes/subjects/sections | ✅ | ✅ | ✅ | — | — |
| Mark attendance | ✅ | ✅ | ✅ | — | — |
| View attendance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assign fees | ✅ | ✅ | — | — | — |
| Record payments | ✅ | ✅ | — | — | — |
| View fee history | ✅ | ✅ | — | ✅ | ✅ |
| Schedule exams | ✅ | ✅ | ✅ | — | — |
| Enter exam results | ✅ | ✅ | ✅ | — | — |
| View exam results | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assign homework | ✅ | ✅ | ✅ | — | — |
| View homework | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage timetable | ✅ | ✅ | ✅ | — | — |
| View timetable | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage parent links | — | ✅ | — | — | — |
| View linked children | — | — | — | — | ✅ |
| Bulk upload / operations | — | ✅ | — | — | — |
| Manage school website (builder) | — | ✅ | — | — | — |
| View public school website | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage admission leads | — | ✅ | — | — | — |
| Super Admin dashboard | ✅ | — | — | — | — |
| Tenant dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage subscription plans | ✅ | — | — | — | — |
| Assign plan to tenant | ✅ | — | — | — | — |
| Record SaaS payment | ✅ | — | — | — | — |
| View subscription plans | ✅ | ✅ | ✅ | — | — |

---

## 4. Super Admin Workflows

The Super Admin operates at the **platform level** and is not bound to any specific school.

### 4.1 Login

```
POST /api/v1/auth/login
No X-Tenant-Slug required
Body: { "username": "superadmin", "password": "<password>" }
```

### 4.2 Create a New School

```
1. POST /api/v1/tenants          — Provision the school schema
2. POST /api/v1/users            — Create SCHOOL_ADMIN user
   (with X-Tenant-Slug: <new_schema>)
```

### 4.3 Platform Dashboard

```
GET /api/v1/dashboard/super-admin-summary
→ {
    "totalTenants": 15,
    "totalUsers": 4320,
    "activeSchools": 14
  }
```

### 4.4 View All Schools

```
GET /api/v1/tenants
→ List of all provisioned schools with their status
```

### 4.5 Manage Subscriptions

```
1. Assign a plan to a tenant:
   POST /api/v1/tenants/{tenantId}/subscribe
   Body: { "planId": "<uuid>", "durationDays": 365 }

2. Record payment received:
   POST /api/v1/payments
   Body: { "tenantId": "greenwood", "amount": 7999, "paymentDate": "2026-04-28", "paymentMethod": "BANK_TRANSFER" }

3. View tenant subscription:
   GET /api/v1/tenants/{tenantId}/subscription

4. Cancel subscription (downgrade):
   DELETE /api/v1/tenants/{tenantId}/subscription
```

### 4.6 Manage Plans

```
1. View all active plans:
   GET /api/v1/plans

2. Create a new plan:
   POST /api/v1/plans
   Body: { "name": "ENTERPRISE", "price": 0, "billingCycleDays": 30, "maxStudents": -1, "maxTeachers": -1, "features": [...] }
```

---

## 5. School Admin Workflows

The School Admin manages all operations within their school.

### 5.1 Initial School Setup Sequence

```
1. Create academic structure:
   POST /api/v1/academics/classes    → e.g., "Grade 10"
   POST /api/v1/academics/subjects   → e.g., "Mathematics"
   POST /api/v1/academics/sections   → e.g., "Section A" linked to Grade 10

2. Add teachers:
   POST /api/v1/teachers

3. Enroll students:
   POST /api/v1/students
   (or bulk: POST /api/v1/bulk/upload with Excel file)

4. Create teacher user accounts:
   POST /api/v1/users  (role: TEACHER)

5. Set up timetable:
   POST /api/v1/timetable/slots

6. Assign fees for the term:
   POST /api/v1/fees/assignments
```

### 5.2 Day-to-Day Admin Operations

| Task | Endpoint / Feature |
|------|----------|
| View dashboard KPIs | `GET /dashboard/tenant-summary` |
| Add new student | `POST /students` |
| View fee reports | `GET /fees/students/{id}/assignments` |
| Record payment | `POST /fees/payments` |
| Schedule exam | `POST /exams` |
| Enter exam results | `POST /exams/results` |
| Bulk import data | `POST /bulk/upload` (or guided bulk operations workflow) |
| Manage school website | Website Builder — General Info, Sections, Gallery, Admission Leads |
| Manage parent links | `GET/POST/DELETE /parents/links` |
| Activate / deactivate tenant | `PATCH /tenants/{tenantId}/status` (Super Admin only) |

---

## 6. Teacher Workflows

Teachers focus on academic delivery, attendance, and assessment.

> **Access boundary:** Teachers can **read** student records but **cannot create or modify** students or user accounts. All creation is handled by the School Admin.

### 6.1 Daily Attendance

```
POST /api/v1/attendances
Headers: X-Tenant-Slug: greenwood
Body per student:
{
  "studentId": "<uuid>",
  "classId": "<uuid>",
  "sectionId": "<uuid>",
  "attendanceDate": "2026-04-28",
  "status": "PRESENT",
  "markedByUserId": "<teacher_user_id>"
}
```

Rules:
- One attendance record per student per date (duplicates rejected)
- Date cannot be in the future
- Status: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`

### 6.2 Assign Homework

```
POST /api/v1/homework
Body:
{
  "title": "Chapter 5 Exercises",
  "description": "Complete problems 1–20",
  "classId": "<uuid>",
  "sectionId": "<uuid>",
  "assignedByUserId": "<teacher_user_id>",
  "dueDate": "2026-05-02"
}
```

### 6.3 Manage Exams

```
Step 1: Schedule exam
POST /api/v1/exams
Body:
{
  "title": "Mid-Term Mathematics",
  "examDate": "2026-05-15",
  "classId": "<uuid>",
  "sectionId": "<uuid>",
  "subjectId": "<uuid>",
  "maxMarks": 100
}

Step 2: Enter results (after exam)
POST /api/v1/exams/results
Body per student:
{
  "examId": "<exam_uuid>",
  "studentId": "<student_uuid>",
  "marksObtained": 87.5,
  "grade": "A",
  "published": false
}
```

---

## 7. Student Workflows

Students have **read-only** access to their academic data.

### 7.1 Login

```
POST /api/v1/auth/login
X-Tenant-Slug: greenwood
Body: { "username": "alice.johnson", "password": "<password>" }
```

> Note: A student must have a corresponding `users` table record (role: STUDENT) created by the Admin.

### 7.2 View Academic Data

| Task | Endpoint |
|------|----------|
| View homework for class | `GET /homework/classes/{classId}` |
| View exam results | `GET /exams/{examId}/results` |
| View timetable | `GET /timetable/classes/{classId}/sections/{sectionId}` |
| View attendance | `GET /attendances?date=YYYY-MM-DD` |
| View fee status | `GET /fees/students/{studentId}/assignments` |

---

## 8. Parent Workflows

Parents can monitor their linked children's activity.

### 8.1 Login

```
POST /api/v1/auth/login
X-Tenant-Slug: greenwood
Body: { "username": "parent.johnson", "password": "<password>" }
```

> A parent user account must be created by the Admin with role `PARENT`. The parent-student link is stored in `parent_students` table.

### 8.2 View Children

```
GET /api/v1/parents/me/children
→ List of linked students with name and admission number
```

### 8.3 Monitor Child's Progress

Using the child's `studentId`:

| Task | Endpoint |
|------|----------|
| View child's attendance | `GET /attendances?date=YYYY-MM-DD` |
| View child's fee status | `GET /fees/students/{studentId}/assignments` |
| View child's exam results | `GET /exams/{examId}/results` |
| View homework | `GET /homework/classes/{classId}` |
| View timetable | `GET /timetable/classes/{classId}/sections/{sectionId}` |

---

## 9. Fee Payment Flow

The fee system tracks assignments and payments with automatic status transitions.

### 9.1 Fee Assignment Statuses

```
PENDING           No payments recorded yet
    │
    ├─ Partial payment ──→ PARTIALLY_PAID    Some balance remains
    │
    └─ Full payment ─────→ PAID              Fully settled
    
PENDING / PARTIALLY_PAID → OVERDUE           (after due date, not yet fully paid)
```

### 9.2 End-to-End Fee Flow

```
1. Admin assigns fee:
   POST /fees/assignments
   { studentId, feeTitle: "Term 1 Tuition", amount: 15000, dueDate: "2026-05-31" }
   → status: PENDING

2. Student/Parent views fee:
   GET /fees/students/{studentId}/assignments
   → sees amount, dueDate, status: PENDING

3. Admin records payment (partial):
   POST /fees/payments
   { feeAssignmentId, amountPaid: 8000, paymentMethod: "CASH", referenceNo: "RCP-001" }
   → fee status auto-transitions to: PARTIALLY_PAID

4. Admin records remaining payment:
   POST /fees/payments
   { feeAssignmentId, amountPaid: 7000, referenceNo: "RCP-002" }
   → fee status auto-transitions to: PAID

5. Overpayment attempt:
   POST /fees/payments { amountPaid: 500 }
   → ERROR: "No balance to receive"
```

### 9.3 Business Rules

- Payment amount cannot exceed remaining balance
- All amounts stored as `DECIMAL` for precision (no floating point)
- Payment method field accepts any string (e.g., `CASH`, `BANK_TRANSFER`, `CHEQUE`)
- Reference number is optional but recommended for audit trail

---

## 10. Timetable System

The timetable stores weekly recurring class schedules per class/section.

### 10.1 Structure

Each timetable slot represents one period in the weekly schedule:

| Field | Description |
|-------|-------------|
| `classId` | Which class this slot belongs to |
| `sectionId` | Optional: which section |
| `subjectId` | Optional: which subject is taught |
| `dayOfWeek` | 1 = Monday … 7 = Sunday |
| `startTime` | Period start (HH:mm) |
| `endTime` | Period end (HH:mm) |
| `label` | Description (e.g., "Mathematics - Period 1") |

### 10.2 Creating a Full Weekly Schedule

```
POST /api/v1/timetable/slots  (repeat per period)

Monday Period 1:
{ classId, sectionId, subjectId, dayOfWeek: 1, startTime: "08:00", endTime: "09:00", label: "Maths" }

Monday Period 2:
{ classId, sectionId, subjectId, dayOfWeek: 1, startTime: "09:00", endTime: "10:00", label: "English" }

Tuesday Period 1:
{ classId, sectionId, subjectId, dayOfWeek: 2, startTime: "08:00", endTime: "09:00", label: "Science" }
...
```

### 10.3 Viewing the Timetable

```
GET /api/v1/timetable/classes/{classId}/sections/{sectionId}
→ Returns all slots for that class/section, sorted by dayOfWeek and startTime
```

Accessible by: all authenticated users (Admin, Teacher, Student, Parent).

---

## 11. Bulk Upload System

The bulk upload feature allows School Admins to import large datasets via Excel.

### 11.1 Supported Data Types

The Excel workbook can contain these sheets:

| Sheet Name | Data |
|------------|------|
| `Students` | Admission no, name, DOB, gender, email, phone |
| `Teachers` | Employee no, name, email, phone, hire date |
| `Classes` | Class name, code |
| `Sections` | Section name, class code |

### 11.2 Upload Steps

```
Step 1: Download the sample template
GET /api/v1/bulk/sample
→ Save the .xlsx file

Step 2: Fill in the template with your data
(follow column headers exactly)

Step 3: Upload the filled file
POST /api/v1/bulk/upload
Content-Type: multipart/form-data
file: <your_filled_template.xlsx>

Step 4: Review the response
{
  "successCount": 48,
  "failedCount": 2,
  "errors": [
    { "sheet": "Students", "row": 5, "error": "Duplicate admission number" }
  ]
}
```

### 11.3 Error Handling

- Rows with errors are **skipped**, not rolled back entirely
- Valid rows in the same upload are still processed
- Errors include sheet name, row number, and reason
- Re-upload only the failed rows after fixing them

---

## 12. Subscription & Billing System

### 12.1 Plans

CloudCampus offers four pre-seeded SaaS plans. Plans are stored in the `public` schema and accessible to all tenants.

| Plan | Price | Billing Cycle | Max Students | Max Teachers |
|------|-------|---------------|--------------|--------------|
| FREE | ₹0 | 30 days | 50 | 5 |
| BASIC | ₹2,999 | 30 days | 300 | 30 |
| PRO | ₹7,999 | 30 days | 1,500 | 150 |
| ENTERPRISE | Custom | 30 days | Unlimited | Unlimited |

### 12.2 Subscription Lifecycle

```
Tenant created (no subscription)
   ↓
Super Admin assigns plan → TenantSubscription (ACTIVE, paymentStatus=PENDING)
   ↓
Payment received offline
   ↓
Super Admin records payment → paymentStatus updated to PAID
   ↓
Subscription expires on endDate (manual renewal in v1)
```

### 12.3 Feature Gating

Features are gated per plan via `SubscriptionGuardService.requireFeature(PlanFeature)`.

If a tenant has **no active subscription**, all features are allowed (fail-open, backward compatible).

If a plan does **not include** a feature, the service throws an error:
```
403: "Your current plan 'BASIC' does not include the 'BULK_UPLOAD' feature. Please upgrade."
```

### 12.4 Available Features (PlanFeature enum)

`STUDENT_MANAGEMENT`, `TEACHER_MANAGEMENT`, `ACADEMIC_MANAGEMENT`, `ATTENDANCE_TRACKING`,
`FEE_MANAGEMENT`, `EXAM_MANAGEMENT`, `HOMEWORK_MANAGEMENT`, `TIMETABLE_MANAGEMENT`,
`PARENT_PORTAL`, `BULK_UPLOAD`, `DASHBOARD_ACCESS`, `ADVANCED_REPORTS`, `CUSTOM_BRANDING`
