# CloudCampus — Postman Collection Guide


> Last Updated: 2026-05-06

This directory contains the Postman collection and environment files for testing the CloudCampus API.

For a concise endpoint map, see [docs/API.md](docs/API.md). For the live request and response contract, use Swagger at `http://localhost:8080/swagger-ui.html`.

---

## Files

| File | Description |
|------|-------------|
| `CloudCampus.postman_collection.json` | Full API collection — all endpoints organized by module |
| `CloudCampus.local.postman_environment.json` | Environment for local development (localhost:8080) |

---

## Importing into Postman

### Step 1: Import the Collection

1. Open Postman
2. Click **Import** (top-left)
3. Drag and drop `CloudCampus.postman_collection.json`
4. Click **Import**

### Step 2: Import an Environment

1. Click **Import** again
2. Drag and drop `CloudCampus.local.postman_environment.json`
3. Click **Import**
4. Select **CloudCampus Local** from the environment dropdown (top-right)

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | Backend base URL | `http://localhost:8080` |
| `token` | JWT access token (auto-captured on login) | `eyJhbGci...` |
| `tenantId` | Active tenant identifier | `greenwood` |
| `studentId` | UUID of a student (for testing student endpoints) | `uuid-here` |
| `feeAssignmentId` | UUID of a fee assignment | `uuid-here` |
| `examId` | UUID of an exam | `uuid-here` |

---

## Auto Token Capture

The **Auth → Login** request has a **Tests** script that automatically saves the JWT token:

```javascript
const response = pm.response.json();
if (response.success && response.data.accessToken) {
    pm.environment.set("token", response.data.accessToken);
}
```

**Run Login first before any other request.** All other requests use `{{token}}` automatically in the `Authorization: Bearer {{token}}` header.

---

## Recommended Test Flow

Run requests in this order for a full end-to-end walkthrough:

### 1. Super Admin Setup

```
Auth → Super Admin Login           → sets {{token}}
Tenants → Create Tenant            → creates a school schema
Users → Create School Admin        → creates SCHOOL_ADMIN user
```

### 2. Tenant Setup

```
Auth → Tenant Login                → sets {{token}} to school admin token
Academics → Create Class           → creates a class
Academics → Create Subject         → creates a subject
Academics → Create Section         → creates a section (links class)
Students → Create Student          → enrolls a student
Teachers → Create Teacher          → registers a teacher
```

### 3. Daily Operations

```
Attendance → Mark Attendance       → logs attendance record
Fees → Assign Fee                  → creates fee assignment
Fees → Record Payment              → logs payment (partial or full)
Exams → Create Exam                → schedules an exam
Exams → Enter Result               → records student marks
Homework → Create Homework         → assigns homework to class
Timetable → Create Slot            → adds a timetable entry
```

### 4. Reporting

```
Dashboard → Tenant Summary         → KPI overview
Students → List Students           → paginated student list
Fees → Student Fee Assignments     → fee status per student
Exams → Results for Exam           → all results for one exam
Bulk Operations → List Operations  → get operation metadata
Bulk Operations → Validate         → validate file rows
Bulk Operations → Preview          → preview new/update/skip counts
Bulk Operations → Execute          → execute validated session
Bulk Operations → Jobs             → track status and retry failures
```

---

## Setting `X-Tenant-Slug`

All tenant-scoped endpoints require the `X-Tenant-Slug` header. This is pre-configured in all collection requests as:

```
X-Tenant-Slug: {{tenantId}}
```

Update `tenantId` in the active environment to match the tenant you are testing.

---

## Switching Tenants

To test a different tenant:
1. Open the **Environment** panel
2. Change `tenantId` to the target tenant identifier (e.g., `sunrise`, `greenwood`)
3. Run **Auth → Tenant Login** with the new tenant's credentials
4. The `token` variable is updated automatically

---

## Bulk Operations Testing

1. Run **Bulk Operations → List Operations**
2. Run **Bulk Upload → Download Sample** with `operation` query param
3. Fill the file for selected operation
4. Run **Bulk Operations → Validate**
5. Run **Bulk Operations → Preview** using returned `validationId`
6. Run **Bulk Operations → Execute**
7. Check **Bulk Operations → Jobs** and retry/download error report if needed
