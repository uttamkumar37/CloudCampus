# CampusCloud — Full API Testing Guide

> **Base URL:** `http://localhost:8080/api/v1`
> **Frontend URL:** `http://localhost:5173`
> **Swagger UI:** `http://localhost:8080/swagger-ui.html`

Every request to a protected endpoint must include two headers:

```
Authorization: Bearer <token>
X-Tenant-ID: <tenant-schema-name>
```

---

## Prerequisites

### 1. Backend and frontend must be running

```bash
# From repo root — start both
./scripts/start-dev.sh
```

Or manually:

```bash
# Terminal 1 — backend
cd backend
JWT_SECRET='MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=' \
DB_URL='jdbc:postgresql://localhost:5432/campuscloud' \
DB_USERNAME='postgres' DB_PASSWORD='postgres' \
BOOTSTRAP_ADMIN_USERNAME='superadmin' \
BOOTSTRAP_ADMIN_PASSWORD='admin@123' \
mvn spring-boot:run

# Terminal 2 — frontend
cd frontend && npm run dev
```

### 2. Capture a JWT token

All subsequent curl examples assume you have exported `TOKEN`:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"superadmin","password":"admin@123"}' \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

echo $TOKEN   # should print a JWT string
```

---

## Module 1 — Auth

### POST /api/v1/auth/login

**No token or tenant header required.**

```bash
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "superadmin",
    "password": "admin@123"
  }' | jq .
```

**Expected:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "username": "superadmin",
    "roles": ["ROLE_SUPER_ADMIN"]
  }
}
```

---

## Module 2 — Tenant Management

> Requires `SUPER_ADMIN` role. Use `X-Tenant-ID: public`.

### POST /api/v1/tenants — Create tenant

```bash
curl -s -X POST http://localhost:8080/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: public' \
  -H 'Content-Type: application/json' \
  -d '{
    "tenantId": "school_1",
    "schoolName": "Sunrise Academy",
    "schemaName": "sunrise"
  }' | jq .
```

**Expected:** `"message": "Tenant created successfully"` with tenant data. A new PostgreSQL schema `sunrise` is created automatically with all 11 domain tables.

### GET /api/v1/tenants — List all tenants

```bash
curl -s http://localhost:8080/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: public' | jq .
```

### GET /api/v1/tenants/{tenantId} — Get tenant by tenantId

```bash
curl -s http://localhost:8080/api/v1/tenants/school_1 \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: public' | jq .
```

---

## Module 3 — User Management

> From here, use the tenant schema as `X-Tenant-ID` (e.g. `sunrise`).
> Roles: `SUPER_ADMIN`, `SCHOOL_ADMIN`

### POST /api/v1/users — Create user in tenant

```bash
curl -s -X POST http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Alice Smith",
    "username": "alice.smith",
    "email": "alice@sunrise.edu",
    "password": "SecurePass123!",
    "role": "SCHOOL_ADMIN"
  }' | jq .
```

Available roles: `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, `PARENT`

### GET /api/v1/users — List users in tenant

```bash
curl -s http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

---

## Module 4 — Student Management

> Roles: create — `SUPER_ADMIN`, `SCHOOL_ADMIN`; read — also `TEACHER`

### POST /api/v1/students — Enroll student

```bash
curl -s -X POST http://localhost:8080/api/v1/students \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' \
  -H 'Content-Type: application/json' \
  -d '{
    "admissionNo": "STU-001",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "2010-05-15",
    "gender": "MALE",
    "email": "john.doe@sunrise.edu",
    "phone": "9876543210"
  }' | jq .
```

Gender values: `MALE`, `FEMALE`, `OTHER`

### GET /api/v1/students — List students (paginated)

```bash
curl -s "http://localhost:8080/api/v1/students?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

### GET /api/v1/students/{id} — Get student by UUID

```bash
STUDENT_ID="<uuid-from-create-response>"

curl -s http://localhost:8080/api/v1/students/$STUDENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

---

## Module 5 — Teacher Management

> Roles: create — `SUPER_ADMIN`, `SCHOOL_ADMIN`; read — also `TEACHER`

### POST /api/v1/teachers — Add teacher

```bash
curl -s -X POST http://localhost:8080/api/v1/teachers \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' \
  -H 'Content-Type: application/json' \
  -d '{
    "employeeNo": "EMP-001",
    "firstName": "Sarah",
    "lastName": "Connor",
    "email": "sarah.connor@sunrise.edu",
    "phone": "9123456789",
    "hireDate": "2023-06-01"
  }' | jq .
```

### GET /api/v1/teachers — List teachers (paginated)

```bash
curl -s "http://localhost:8080/api/v1/teachers?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

### GET /api/v1/teachers/{id} — Get teacher by UUID

```bash
TEACHER_ID="<uuid-from-create-response>"

curl -s http://localhost:8080/api/v1/teachers/$TEACHER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

---

## Module 6 — Academic (Classes, Subjects, Sections)

> Roles: create — `SUPER_ADMIN`, `SCHOOL_ADMIN`; read — also `TEACHER`

### POST /api/v1/academics/classes — Create class

```bash
curl -s -X POST http://localhost:8080/api/v1/academics/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Grade 10",
    "code": "G10"
  }' | jq .
```

### GET /api/v1/academics/classes — List classes

```bash
curl -s http://localhost:8080/api/v1/academics/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

### POST /api/v1/academics/subjects — Create subject

```bash
curl -s -X POST http://localhost:8080/api/v1/academics/subjects \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Mathematics",
    "code": "MATH"
  }' | jq .
```

### GET /api/v1/academics/subjects — List subjects

```bash
curl -s http://localhost:8080/api/v1/academics/subjects \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

### POST /api/v1/academics/sections — Create section

Requires a valid `classId` UUID from the class creation response above.

```bash
CLASS_ID="<uuid-from-class-create-response>"

curl -s -X POST http://localhost:8080/api/v1/academics/sections \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' \
  -H 'Content-Type: application/json' \
  -d "{
    \"name\": \"Section A\",
    \"classId\": \"$CLASS_ID\"
  }" | jq .
```

### GET /api/v1/academics/sections — List sections

```bash
curl -s http://localhost:8080/api/v1/academics/sections \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

---

## Module 7 — Attendance

> Roles: `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`

### POST /api/v1/attendances — Mark attendance

Requires valid UUIDs for student, class, section, and markedByUserId.

```bash
curl -s -X POST http://localhost:8080/api/v1/attendances \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' \
  -H 'Content-Type: application/json' \
  -d "{
    \"studentId\": \"$STUDENT_ID\",
    \"classId\": \"$CLASS_ID\",
    \"sectionId\": \"$SECTION_ID\",
    \"attendanceDate\": \"$(date +%Y-%m-%d)\",
    \"status\": \"PRESENT\",
    \"markedByUserId\": \"$USER_ID\"
  }" | jq .
```

Status values: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`

### GET /api/v1/attendances/{attendanceId} — Get by ID

```bash
curl -s http://localhost:8080/api/v1/attendances/$ATTENDANCE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

### GET /api/v1/attendances?date=YYYY-MM-DD — Get by date

```bash
curl -s "http://localhost:8080/api/v1/attendances?date=$(date +%Y-%m-%d)" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

---

## Module 8 — Fees

> Roles: `SUPER_ADMIN`, `SCHOOL_ADMIN`

### POST /api/v1/fees/assignments — Assign fee to student

```bash
curl -s -X POST http://localhost:8080/api/v1/fees/assignments \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' \
  -H 'Content-Type: application/json' \
  -d "{
    \"studentId\": \"$STUDENT_ID\",
    \"feeTitle\": \"Term 1 Tuition Fee\",
    \"amount\": 5000.00,
    \"dueDate\": \"2026-05-31\"
  }" | jq .
```

### POST /api/v1/fees/payments — Record payment

Requires a valid `feeAssignmentId` from the assignment response.

```bash
curl -s -X POST http://localhost:8080/api/v1/fees/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' \
  -H 'Content-Type: application/json' \
  -d "{
    \"feeAssignmentId\": \"$FEE_ASSIGNMENT_ID\",
    \"amountPaid\": 2500.00,
    \"paymentDate\": \"$(date +%Y-%m-%d)\",
    \"paymentMethod\": \"CASH\",
    \"referenceNo\": \"REF-001\",
    \"receivedByUserId\": \"$USER_ID\"
  }" | jq .
```

Status auto-transitions: `PENDING` → `PARTIALLY_PAID` → `PAID`. Overpaying returns a 400.

### GET /api/v1/fees/students/{studentId}/assignments — Get fees for student

```bash
curl -s http://localhost:8080/api/v1/fees/students/$STUDENT_ID/assignments \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

---

## Module 9 — Exams

> Roles: create — `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`; read — same

### POST /api/v1/exams — Schedule exam

Requires valid UUIDs for classId, sectionId, subjectId.

```bash
curl -s -X POST http://localhost:8080/api/v1/exams \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' \
  -H 'Content-Type: application/json' \
  -d "{
    \"title\": \"Mid-Term Math Exam\",
    \"examDate\": \"2026-06-15\",
    \"classId\": \"$CLASS_ID\",
    \"sectionId\": \"$SECTION_ID\",
    \"subjectId\": \"$SUBJECT_ID\",
    \"maxMarks\": 100
  }" | jq .
```

### GET /api/v1/exams/classes/{classId} — Get exams by class

```bash
curl -s http://localhost:8080/api/v1/exams/classes/$CLASS_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

### POST /api/v1/exams/results — Enter exam result

```bash
curl -s -X POST http://localhost:8080/api/v1/exams/results \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' \
  -H 'Content-Type: application/json' \
  -d "{
    \"examId\": \"$EXAM_ID\",
    \"studentId\": \"$STUDENT_ID\",
    \"marksObtained\": 87,
    \"grade\": \"A\",
    \"remarks\": \"Excellent performance\",
    \"published\": true
  }" | jq .
```

Marks exceeding `maxMarks` returns a 400 error.

### GET /api/v1/exams/{examId}/results — Get results for exam

```bash
curl -s http://localhost:8080/api/v1/exams/$EXAM_ID/results \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' | jq .
```

---

## End-to-End Test Sequence (Copy-Paste Shell Script)

Run this entire block in one terminal after starting the backend.

```bash
#!/usr/bin/env sh
set -eu
BASE="http://localhost:8080/api/v1"
TENANT="sunrise"

# ── Step 1: Login ─────────────────────────────────────────────────────────────
echo "=== Step 1: Login ==="
LOGIN=$(curl -s -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"superadmin","password":"admin@123"}')
echo "$LOGIN" | jq .
TOKEN=$(printf '%s' "$LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
AUTH="Authorization: Bearer $TOKEN"

# ── Step 2: Create tenant ─────────────────────────────────────────────────────
echo "=== Step 2: Create tenant ==="
curl -s -X POST "$BASE/tenants" \
  -H "$AUTH" -H 'X-Tenant-ID: public' -H 'Content-Type: application/json' \
  -d '{"tenantId":"sunrise","schoolName":"Sunrise Academy","schemaName":"sunrise"}' | jq .

# ── Step 3: Create user ───────────────────────────────────────────────────────
echo "=== Step 3: Create user ==="
USER_RESP=$(curl -s -X POST "$BASE/users" \
  -H "$AUTH" -H "X-Tenant-ID: $TENANT" -H 'Content-Type: application/json' \
  -d '{"fullName":"Alice Smith","username":"alice.smith","email":"alice@sunrise.edu","password":"SecurePass123!","role":"SCHOOL_ADMIN"}')
echo "$USER_RESP" | jq .
USER_ID=$(printf '%s' "$USER_RESP" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# ── Step 4: Create student ────────────────────────────────────────────────────
echo "=== Step 4: Create student ==="
STU_RESP=$(curl -s -X POST "$BASE/students" \
  -H "$AUTH" -H "X-Tenant-ID: $TENANT" -H 'Content-Type: application/json' \
  -d '{"admissionNo":"STU-001","firstName":"John","lastName":"Doe","dateOfBirth":"2010-05-15","gender":"MALE","email":"john@sunrise.edu","phone":"9876543210"}')
echo "$STU_RESP" | jq .
STUDENT_ID=$(printf '%s' "$STU_RESP" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# ── Step 5: Create class ──────────────────────────────────────────────────────
echo "=== Step 5: Create class ==="
CLASS_RESP=$(curl -s -X POST "$BASE/academics/classes" \
  -H "$AUTH" -H "X-Tenant-ID: $TENANT" -H 'Content-Type: application/json' \
  -d '{"name":"Grade 10","code":"G10"}')
echo "$CLASS_RESP" | jq .
CLASS_ID=$(printf '%s' "$CLASS_RESP" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# ── Step 6: Create subject ────────────────────────────────────────────────────
echo "=== Step 6: Create subject ==="
SUBJ_RESP=$(curl -s -X POST "$BASE/academics/subjects" \
  -H "$AUTH" -H "X-Tenant-ID: $TENANT" -H 'Content-Type: application/json' \
  -d '{"name":"Mathematics","code":"MATH"}')
echo "$SUBJ_RESP" | jq .
SUBJECT_ID=$(printf '%s' "$SUBJ_RESP" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# ── Step 7: Create section ────────────────────────────────────────────────────
echo "=== Step 7: Create section ==="
SEC_RESP=$(curl -s -X POST "$BASE/academics/sections" \
  -H "$AUTH" -H "X-Tenant-ID: $TENANT" -H 'Content-Type: application/json' \
  -d "{\"name\":\"Section A\",\"classId\":\"$CLASS_ID\"}")
echo "$SEC_RESP" | jq .
SECTION_ID=$(printf '%s' "$SEC_RESP" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# ── Step 8: Mark attendance ───────────────────────────────────────────────────
echo "=== Step 8: Mark attendance ==="
TODAY=$(date +%Y-%m-%d)
curl -s -X POST "$BASE/attendances" \
  -H "$AUTH" -H "X-Tenant-ID: $TENANT" -H 'Content-Type: application/json' \
  -d "{\"studentId\":\"$STUDENT_ID\",\"classId\":\"$CLASS_ID\",\"sectionId\":\"$SECTION_ID\",\"attendanceDate\":\"$TODAY\",\"status\":\"PRESENT\",\"markedByUserId\":\"$USER_ID\"}" | jq .

# ── Step 9: Assign fee ────────────────────────────────────────────────────────
echo "=== Step 9: Assign fee ==="
FEE_RESP=$(curl -s -X POST "$BASE/fees/assignments" \
  -H "$AUTH" -H "X-Tenant-ID: $TENANT" -H 'Content-Type: application/json' \
  -d "{\"studentId\":\"$STUDENT_ID\",\"feeTitle\":\"Term 1 Tuition\",\"amount\":5000.00,\"dueDate\":\"2026-05-31\"}")
echo "$FEE_RESP" | jq .
FEE_ID=$(printf '%s' "$FEE_RESP" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# ── Step 10: Record payment ───────────────────────────────────────────────────
echo "=== Step 10: Record payment ==="
curl -s -X POST "$BASE/fees/payments" \
  -H "$AUTH" -H "X-Tenant-ID: $TENANT" -H 'Content-Type: application/json' \
  -d "{\"feeAssignmentId\":\"$FEE_ID\",\"amountPaid\":5000.00,\"paymentDate\":\"$TODAY\",\"paymentMethod\":\"CASH\",\"referenceNo\":\"REF-001\",\"receivedByUserId\":\"$USER_ID\"}" | jq .

# ── Step 11: Schedule exam ────────────────────────────────────────────────────
echo "=== Step 11: Schedule exam ==="
EXAM_RESP=$(curl -s -X POST "$BASE/exams" \
  -H "$AUTH" -H "X-Tenant-ID: $TENANT" -H 'Content-Type: application/json' \
  -d "{\"title\":\"Mid-Term Math\",\"examDate\":\"2026-06-15\",\"classId\":\"$CLASS_ID\",\"sectionId\":\"$SECTION_ID\",\"subjectId\":\"$SUBJECT_ID\",\"maxMarks\":100}")
echo "$EXAM_RESP" | jq .
EXAM_ID=$(printf '%s' "$EXAM_RESP" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# ── Step 12: Enter exam result ────────────────────────────────────────────────
echo "=== Step 12: Enter exam result ==="
curl -s -X POST "$BASE/exams/results" \
  -H "$AUTH" -H "X-Tenant-ID: $TENANT" -H 'Content-Type: application/json' \
  -d "{\"examId\":\"$EXAM_ID\",\"studentId\":\"$STUDENT_ID\",\"marksObtained\":87,\"grade\":\"A\",\"remarks\":\"Excellent\",\"published\":true}" | jq .

echo "=== All tests passed ==="
```

---

## Error Scenarios

| Scenario | Expected HTTP Status |
|---|---|
| Wrong password / username | `401 Unauthorized` |
| Missing or invalid JWT | `401 Unauthorized` |
| Valid JWT but insufficient role | `403 Forbidden` |
| Missing X-Tenant-ID header | `400 Bad Request` |
| Duplicate admissionNo / email | `400 Bad Request` |
| Overpay fee (amount > remaining) | `400 Bad Request` |
| Marks exceed maxMarks | `400 Bad Request` |
| Duplicate attendance same student + date | `400 Bad Request` |
| Resource not found by UUID | `404 Not Found` |

---

## Quick Reference — All Endpoints

| Module | Method | Path | Min Role |
|---|---|---|---|
| Auth | POST | /api/v1/auth/login | Public |
| Tenant | POST | /api/v1/tenants | SUPER_ADMIN |
| Tenant | GET | /api/v1/tenants | SUPER_ADMIN |
| Tenant | GET | /api/v1/tenants/{tenantId} | SUPER_ADMIN |
| User | POST | /api/v1/users | SCHOOL_ADMIN |
| User | GET | /api/v1/users | SCHOOL_ADMIN |
| Student | POST | /api/v1/students | SCHOOL_ADMIN |
| Student | GET | /api/v1/students | TEACHER |
| Student | GET | /api/v1/students/{id} | TEACHER |
| Teacher | POST | /api/v1/teachers | SCHOOL_ADMIN |
| Teacher | GET | /api/v1/teachers | TEACHER |
| Teacher | GET | /api/v1/teachers/{id} | TEACHER |
| Academic | POST | /api/v1/academics/classes | SCHOOL_ADMIN |
| Academic | GET | /api/v1/academics/classes | TEACHER |
| Academic | POST | /api/v1/academics/subjects | SCHOOL_ADMIN |
| Academic | GET | /api/v1/academics/subjects | TEACHER |
| Academic | POST | /api/v1/academics/sections | SCHOOL_ADMIN |
| Academic | GET | /api/v1/academics/sections | TEACHER |
| Attendance | POST | /api/v1/attendances | TEACHER |
| Attendance | GET | /api/v1/attendances/{id} | TEACHER |
| Attendance | GET | /api/v1/attendances?date= | TEACHER |
| Fees | POST | /api/v1/fees/assignments | SCHOOL_ADMIN |
| Fees | POST | /api/v1/fees/payments | SCHOOL_ADMIN |
| Fees | GET | /api/v1/fees/students/{id}/assignments | SCHOOL_ADMIN |
| Exam | POST | /api/v1/exams | TEACHER |
| Exam | GET | /api/v1/exams/classes/{classId} | TEACHER |
| Exam | POST | /api/v1/exams/results | TEACHER |
| Exam | GET | /api/v1/exams/{examId}/results | TEACHER |

---

## UI Testing Guide

> **Frontend URL:** `http://localhost:5173`
> Start the frontend with `cd frontend && npm run dev` (or `./scripts/start-dev.sh`).

The React frontend currently has **four routes** wired:

| Route | Page | Status |
|---|---|---|
| `/login` | Login page | ✅ Fully implemented |
| `/dashboard` | Dashboard overview | ✅ Placeholder cards |
| `/students` | Students list + create form | ✅ Fully implemented |
| `/teachers` | Teachers page | 🟡 Scaffold (no form yet) |
| `/academic` | Academic page | 🟡 Scaffold (no form yet) |

---

### Step 1 — Logging in

1. Open `http://localhost:5173` in a browser. You are redirected to `/login`.
2. Fill in the three fields and click **Sign in**.

#### Which credentials to use

There are two types of accounts — the bootstrap super-admin and school users created inside a tenant schema.

**Super-admin (system-level, no tenant schema)**

| Field | Value |
|---|---|
| **Tenant ID** | `public` |
| **Username** | `superadmin` |
| **Password** | `admin@123` |

Use this account to manage tenants and bootstrap a new school.

---

**School Admin (lives inside a tenant schema)**

This is the `schooladmin` user you created via `POST /api/v1/users`. Use the **schema name** of that tenant as the Tenant ID — not the tenantId string.

| Field | Value |
|---|---|
| **Tenant ID** | `sunrise` ← the `schemaName` you used when creating the tenant |
| **Username** | `schooladmin` |
| **Password** | the password you set when creating the user (e.g. `SecurePass123!`) |

> **How to find your tenant's schema name:**
> ```bash
> curl -s http://localhost:8080/api/v1/tenants \
>   -H "Authorization: Bearer $TOKEN" \
>   -H 'X-Tenant-ID: public' | jq '.data[] | {tenantId, schemaName}'
> ```
> The `schemaName` value is what you put in the **Tenant ID** field on the login form.

---

**To create a school admin user for a tenant** (one-time setup via curl, then log in via UI):

```bash
# 1. Login as superadmin to get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"superadmin","password":"admin@123"}' \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

# 2. Create school admin inside the tenant schema
curl -s -X POST http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: sunrise' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Admin User",
    "username": "schooladmin",
    "email": "admin@school.com",
    "password": "SecurePass123!",
    "role": "SCHOOL_ADMIN"
  }' | jq .
```

Now go to `http://localhost:5173` and log in with `Tenant ID: sunrise`, `Username: schooladmin`.

---

3. On success you land on `/dashboard`. The JWT and tenant ID are stored in `localStorage` under keys `authToken` and `tenantId`.
4. **What to verify:**
   - Page title reads "Dashboard — Welcome to EduTenant."
   - Three stat cards (Students / Teachers / Classes) are visible (values show `-` until API data is wired).
   - No error toast or red message.

**Error cases to test:**

| Input | Expected result |
|---|---|
| Wrong password | Red inline error: "Invalid credentials" |
| Non-existent username | Red inline error: "Invalid credentials" |
| `public` as Tenant ID for a school user | `401 Unauthorized` — user does not exist in public schema |
| Tenant schema name for super-admin | `401 Unauthorized` — superadmin does not exist in tenant schema |
| Empty Tenant ID | Browser prevents submit (field is `required`) |
| Correct credentials | Redirect to `/dashboard` |

---

### Step 2 — Sidebar navigation

After login the left sidebar is visible. Click each item:

- **Dashboard** → `/dashboard` — stat cards
- **Students** → `/students` — student table + create form
- **Teachers** → `/teachers` — scaffold placeholder
- **Academic** → `/academic` — scaffold placeholder

---

### Step 3 — Testing the Students module (fully wired)

Navigate to `http://localhost:5173/students`.

#### 3a — List view

- The table loads immediately via `GET /api/v1/students?page=0&size=20`.
- Open **DevTools → Network** and confirm the request includes:
  - `Authorization: Bearer <jwt>`
  - `X-Tenant-ID: <your-tenant>`
- An empty list shows an empty table with headers: Admission No, Name, DOB, Gender, Contact, Status.

#### 3b — Create a student

Fill the **Create Student** form on the same page:

| Field | Example value |
|---|---|
| Admission No | `STU-001` |
| Date of Birth | `2010-05-15` |
| First Name | `John` |
| Last Name | `Doe` |
| Email | `john@sunrise.edu` |
| Phone | `9876543210` |
| Gender | Select `Male` |

Click **Save** (or the submit button):

- The form calls `POST /api/v1/students`.
- On success the form resets and the new student appears in the table immediately (TanStack Query cache invalidation).
- **What to verify:**
  - New row shows correct Admission No, Name, DOB, Gender, Contact.
  - Status badge shows **Active** in green.

**Error cases to test:**

| Input | Expected result |
|---|---|
| Duplicate Admission No | Red error message below the form |
| Missing required field | Browser prevents submit |

---

### Step 4 — Verifying auth guards

1. Clear `localStorage` (DevTools → Application → Local Storage → clear all).
2. Navigate to `http://localhost:5173/students`.
3. You should be redirected to `/login` (PrivateRoute guard).
4. Log in again and confirm you return to `/students`.

---

### Step 5 — Inspecting requests in DevTools

For every API call you can verify the headers sent by the frontend:

1. DevTools → **Network** tab → filter by `Fetch/XHR`.
2. Click any `/api/v1/...` request.
3. **Request Headers** panel should show:

   ```
   Authorization: Bearer eyJ...
   X-Tenant-ID: sunrise
   Content-Type: application/json
   ```

This confirms the Axios interceptors in `src/api/client.ts` are working.

---

### Step 6 — Swagger UI (alternative to curl)

Swagger is auto-generated by SpringDoc OpenAPI:

```
http://localhost:8080/swagger-ui.html
```

1. Open the URL.
2. Click **Authorize** (lock icon top-right).
3. Enter `Bearer <your-jwt>` in the value field and click **Authorize**.
4. Expand any endpoint group (e.g. **student-controller**) and click **Try it out**.
5. Add `X-Tenant-ID: sunrise` in the header field that appears.
6. Click **Execute** — response body and HTTP status appear inline.

> Note: Swagger does not auto-add `X-Tenant-ID`. You must set it manually in each "Try it out" panel.

---

### What is NOT yet testable from the UI

The following backend modules have no frontend UI yet. Use curl or Swagger for these:

| Module | Status |
|---|---|
| Tenant creation | API only (SUPER_ADMIN via curl) |
| Teacher create/edit | Route exists, form not built yet |
| Academic (classes/subjects/sections) | Route exists, form not built yet |
| Attendance | API only |
| Fees | API only |
| Exams | API only |
