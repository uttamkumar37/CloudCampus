# Testing Guide

---

## Table of Contents

1. [Testing Strategy Overview](#1-testing-strategy-overview)
2. [Running Backend Unit Tests](#2-running-backend-unit-tests)
3. [Unit Test Coverage](#3-unit-test-coverage)
4. [Manual API Testing with curl](#4-manual-api-testing-with-curl)
5. [Postman Testing](#5-postman-testing)
6. [Testing Business Rules](#6-testing-business-rules)
7. [Test Patterns Used](#7-test-patterns-used)
8. [Integration Tests](#8-integration-tests)

---

## 1. Testing Strategy Overview

| Layer | Type | Framework | Status |
|-------|------|-----------|--------|
| Service Layer | Unit tests (mock dependencies) | JUnit 5 + Mockito | ✅ Done |
| Controller Layer | Basic auth/tenant behavior via integration tests | @SpringBootTest | ⚠️ Partial |
| Integration | Full stack with real DB | Testcontainers + @SpringBootTest | ✅ Available |
| API | Manual via Postman / curl | Postman Collections | ✅ Available |

---

## 2. Running Backend Unit Tests

### Run All Tests

```bash
cd backend
mvn test
```

### Run a Specific Test Class

```bash
mvn test -Dtest=UserServiceImplTest
mvn test -Dtest=ExamServiceImplTest
mvn test -Dtest=FeesServiceImplTest
```

### Run with Verbose Output

```bash
mvn test -Dsurefire.useFile=false
```

### Test Reports

After running tests, HTML/XML reports are generated at:

```
backend/target/surefire-reports/
├── com.cloudcampus.user.service.UserServiceImplTest.txt
├── com.cloudcampus.exam.service.ExamServiceImplTest.txt
├── com.cloudcampus.fees.service.FeesServiceImplTest.txt
├── TEST-com.cloudcampus.user.service.UserServiceImplTest.xml
├── TEST-com.cloudcampus.exam.service.ExamServiceImplTest.xml
└── TEST-com.cloudcampus.fees.service.FeesServiceImplTest.xml
```

### Seed Demo Test Data

```bash
python3 scripts/seed_demo.py
```

The seed script provisions one school tenant with representative users and academic/operational data for end-to-end verification.

### Run Frontend Unit Tests

```bash
cd frontend
npm run test
```

This executes Vitest + Testing Library suites (for example endpoint builders and parent-link admin page behavior).

---

## 3. Unit Test Coverage

### 3.1 UserServiceImplTest

**Location:** `backend/src/test/java/com/cloudcampus/user/service/UserServiceImplTest.java`

| Test Case | Description |
|-----------|-------------|
| `createUser_success` | Happy path — creates user, returns `UserResponse` |
| `createUser_throwsWhenUsernameAlreadyExists` | Rejects duplicate username |
| `createUser_normalizesUsernameAndEmail` | Username and email converted to lowercase |
| `createUser_throwsWhenTenantIsPublicSchema` | Blocks operations on `public` schema |

**Setup Pattern:**
```java
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserAccountRepository repo;
    @Mock private PasswordEncoder passwordEncoder;
    @InjectMocks private UserServiceImpl service;

    @BeforeEach
    void setTenantContext() {
        TenantContext.setTenant("school_a");
    }

    @AfterEach
    void clearTenantContext() {
        TenantContext.clear();
    }
}
```

---

### 3.2 ExamServiceImplTest

**Location:** `backend/src/test/java/com/cloudcampus/exam/service/ExamServiceImplTest.java`

| Test Case | Description |
|-----------|-------------|
| `createExam_success` | Schedules exam with unique title+date+class+section+subject |
| `createExam_throwsOnDuplicateSchedule` | UNIQUE constraint violated → exception thrown |
| `createExamResult_success` | Enters result within max marks |
| `createExamResult_throwsWhenMarksExceedMaxMarks` | `marksObtained > maxMarks` → rejected |
| `createExamResult_throwsWhenDuplicateResult` | UNIQUE(exam_id, student_id) violated |

---

### 3.3 FeesServiceImplTest

**Location:** `backend/src/test/java/com/cloudcampus/fees/service/FeesServiceImplTest.java`

| Test Case | Description |
|-----------|-------------|
| `createFeeAssignment_success` | Creates assignment with PENDING status |
| `recordPayment_partialPayment_transitionsToPartiallyPaid` | Partial amount → status: PARTIALLY_PAID |
| `recordPayment_fullPayment_transitionsToPaid` | Full remaining amount → status: PAID |
| `recordPayment_throwsWhenNoBalanceRemains` | Overpayment → exception: "No balance to receive" |
| `recordPayment_throwsWhenAmountExceedsBalance` | Amount > remaining → rejected |

---

## 4. Manual API Testing with curl

### 4.1 Super Admin Login

```bash
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"YourPassword123"}' \
  | python3 -m json.tool
```

Save the token:
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"YourPassword123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
echo "Token: $TOKEN"
```

---

### 4.2 Create a New Tenant

```bash
curl -s -X POST http://localhost:8080/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "greenwood",
    "schoolName": "Greenwood High School",
    "schemaName": "greenwood",
    "logoUrl": "https://example.com/logo.png",
    "primaryColor": "#10b981"
  }' | python3 -m json.tool
```

---

### 4.3 Create School Admin User

```bash
curl -s -X POST http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Slug: greenwood" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Sarah Admin",
    "username": "sarah.admin",
    "email": "sarah@greenwood.edu",
    "password": "AdminPass123!",
    "role": "SCHOOL_ADMIN"
  }' | python3 -m json.tool
```

---

### 4.4 Tenant Login

```bash
TENANT_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: greenwood" \
  -d '{"username":"sarah.admin","password":"AdminPass123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
```

---

### 4.5 Create a Class

```bash
curl -s -X POST http://localhost:8080/api/v1/academics/classes \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-Slug: greenwood" \
  -H "Content-Type: application/json" \
  -d '{"name":"Grade 10","code":"G10"}' \
  | python3 -m json.tool
```

---

### 4.6 Enroll a Student

```bash
curl -s -X POST http://localhost:8080/api/v1/students \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-Slug: greenwood" \
  -H "Content-Type: application/json" \
  -d '{
    "admissionNo": "ADM-2024-001",
    "firstName": "Alice",
    "lastName": "Johnson",
    "dateOfBirth": "2010-05-15",
    "gender": "FEMALE",
    "email": "alice@example.com"
  }' | python3 -m json.tool
```

---

### 4.7 Mark Attendance

```bash
curl -s -X POST http://localhost:8080/api/v1/attendances \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-Slug: greenwood" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "<student_uuid>",
    "classId": "<class_uuid>",
    "sectionId": "<section_uuid>",
    "attendanceDate": "2026-04-28",
    "status": "PRESENT"
  }' | python3 -m json.tool
```

---

### 4.8 Assign a Fee

```bash
curl -s -X POST http://localhost:8080/api/v1/fees/assignments \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-Slug: greenwood" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "<student_uuid>",
    "feeTitle": "Term 1 Tuition Fee",
    "amount": 15000.00,
    "dueDate": "2026-05-31"
  }' | python3 -m json.tool
```

---

### 4.9 Record a Payment

```bash
curl -s -X POST http://localhost:8080/api/v1/fees/payments \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-Slug: greenwood" \
  -H "Content-Type: application/json" \
  -d '{
    "feeAssignmentId": "<assignment_uuid>",
    "amountPaid": 8000.00,
    "paymentDate": "2026-04-28",
    "paymentMethod": "CASH",
    "referenceNo": "RCP-001"
  }' | python3 -m json.tool
```

---

### 4.10 Schedule an Exam

```bash
curl -s -X POST http://localhost:8080/api/v1/exams \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-Slug: greenwood" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mid-Term Mathematics",
    "examDate": "2026-05-15",
    "classId": "<class_uuid>",
    "sectionId": "<section_uuid>",
    "subjectId": "<subject_uuid>",
    "maxMarks": 100
  }' | python3 -m json.tool
```

---

### 4.11 Get Dashboard Summary

```bash
# Tenant dashboard
curl -s http://localhost:8080/api/v1/dashboard/tenant-summary \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-Slug: greenwood" \
  | python3 -m json.tool

# Super admin dashboard
curl -s http://localhost:8080/api/v1/dashboard/super-admin-summary \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

---

### 4.12 Test Error Scenarios

**Duplicate admission number (expected 409):**
```bash
# Enroll same student twice — second call should fail
curl -s -X POST http://localhost:8080/api/v1/students \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-Slug: greenwood" \
  -H "Content-Type: application/json" \
  -d '{"admissionNo":"ADM-2024-001","firstName":"Alice","lastName":"Johnson","dateOfBirth":"2010-05-15","gender":"FEMALE"}' \
  | python3 -m json.tool
```

**Missing X-Tenant-Slug (expected 500 or error):**
```bash
curl -s -X GET http://localhost:8080/api/v1/students \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  | python3 -m json.tool
```

**Unauthorized role (expected 403):**
```bash
# Try to create a tenant as SCHOOL_ADMIN
curl -s -X POST http://localhost:8080/api/v1/tenants \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"test","schoolName":"Test","schemaName":"test"}' \
  | python3 -m json.tool
```

---

## 5. Postman Testing

See [postman/10_README.md](./postman/10_README.md) for full import and usage instructions.

### Quick Start

1. Open Postman
2. Import `docs/postman/CloudCampus.postman_collection.json`
3. Import `docs/postman/CloudCampus.local.postman_environment.json`
4. Select the **CloudCampus Local** environment
5. Run **Auth → Login** first — the token is auto-captured
6. All subsequent requests use `{{token}}` and `{{tenantId}}` automatically

---

## 6. Testing Business Rules

### 6.1 Tenant Isolation Test

Verify that data in tenant A is not visible in tenant B:

```bash
# Create student in greenwood
curl -s -X POST http://localhost:8080/api/v1/students \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-Slug: greenwood" \
  -H "Content-Type: application/json" \
  -d '{"admissionNo":"ISO-001","firstName":"Test","lastName":"Isolation","dateOfBirth":"2010-01-01","gender":"MALE"}' \
  | python3 -m json.tool

# List students from sunrise — should NOT see greenwood's student
curl -s http://localhost:8080/api/v1/students \
  -H "Authorization: Bearer $SUNRISE_TOKEN" \
  -H "X-Tenant-Slug: sunrise" \
  | python3 -m json.tool
```

---

### 6.2 Fee Status Transition Test

```bash
# 1. Assign fee of 1000
ASSIGNMENT_ID=$(... create fee assignment, capture ID ...)

# 2. Pay 600 → expect PARTIALLY_PAID
curl -X POST .../fees/payments -d '{"feeAssignmentId":"...","amountPaid":600,...}'

# 3. Pay remaining 400 → expect PAID
curl -X POST .../fees/payments -d '{"feeAssignmentId":"...","amountPaid":400,...}'

# 4. Attempt overpayment → expect error
curl -X POST .../fees/payments -d '{"feeAssignmentId":"...","amountPaid":100,...}'
# Expected: {"success":false,"message":"No balance to receive"}
```

---

### 6.3 Exam Marks Overflow Test

```bash
# Create exam with maxMarks: 50
# Attempt to enter result with marksObtained: 60
curl -X POST .../exams/results \
  -d '{"examId":"...","studentId":"...","marksObtained":60}'
# Expected: 422 {"success":false,"message":"Marks obtained exceed maximum marks"}
```

---

## 7. Test Patterns Used

### Pattern 1: TenantContext Setup/Teardown

Every service test must set and clear the tenant context:

```java
@BeforeEach
void setUp() {
    TenantContext.setTenant("test_school");
}

@AfterEach
void tearDown() {
    TenantContext.clear();
}
```

### Pattern 2: Repository Mocking

```java
@Mock private StudentRepository studentRepository;
@InjectMocks private StudentServiceImpl studentService;

@Test
void createStudent_throwsOnDuplicateAdmissionNo() {
    when(studentRepository.existsByAdmissionNo("ADM-001")).thenReturn(true);

    assertThrows(IllegalArgumentException.class, () ->
        studentService.createStudent(new StudentCreateRequest("ADM-001", ...)));
}
```

### Pattern 3: Verify Normalization

```java
@Test
void createUser_normalizesUsernameToLowercase() {
    when(repo.existsByUsername(anyString())).thenReturn(false);
    when(repo.existsByEmail(anyString())).thenReturn(false);
    when(passwordEncoder.encode(anyString())).thenReturn("hashed");

    UserResponse response = service.createUser(
        new UserCreateRequest("Jane", "JANE.DOE", "JANE@SCHOOL.EDU", "pass", "TEACHER")
    );

    assertEquals("jane.doe", response.username());
    assertEquals("jane@school.edu", response.email());
}
```

---

## 8. Integration Tests

Integration tests are available and run with Testcontainers + Spring Boot.

### Setup

```xml
<!-- dependencies already included -->
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
```

### Covered Scenarios

| Scenario | Description |
|----------|-------------|
| Tenant provisioning | `POST /tenants` creates schema and all 13 tables |
| Student CRUD | Create → list → get by ID, all in correct schema |
| Fee state machine | Full payment lifecycle from PENDING to PAID |
| Tenant isolation | Student in schema A not visible via schema B |
| Exam marks guard | `marksObtained > maxMarks` rejected |
| JWT expiry | Expired token returns 401 |
| Role enforcement | TEACHER cannot access `/tenants` (403) |

---

## 9. Role-Based Authentication Test Cases

### 9.1 Login — Expected Responses

| Role | Request | Expected |
|------|---------|----------|
| SUPER_ADMIN | `POST /auth/login` — no X-Tenant-Slug | 200 + `accessToken`, `role: SUPER_ADMIN` |
| SCHOOL_ADMIN | `POST /auth/login` + `X-Tenant-Slug: greenwood` | 200 + `role: SCHOOL_ADMIN` |
| TEACHER | `POST /auth/login` + `X-Tenant-Slug: greenwood` | 200 + `role: TEACHER` |
| STUDENT | `POST /auth/login` + `X-Tenant-Slug: greenwood` | 200 + `role: STUDENT` |
| PARENT | `POST /auth/login` + `X-Tenant-Slug: greenwood` | 200 + `role: PARENT` |
| Any | Wrong password | 401 |
| Tenant user | Missing X-Tenant-Slug | 400 |

### 9.2 TEACHER — Allowed vs Forbidden

```bash
# Login as TEACHER
TEACHER_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: greenwood" \
  -d '{"username":"john.teacher","password":"TeacherPass123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
```

| Endpoint | Method | Expected Status |
|----------|--------|-----------------|
| `GET /api/v1/students` | GET | ✅ 200 |
| `POST /api/v1/students` | POST | ❌ 403 |
| `POST /api/v1/attendances` | POST | ✅ 200 |
| `GET /api/v1/attendances?date=2026-04-28` | GET | ✅ 200 |
| `POST /api/v1/homework` | POST | ✅ 200 |
| `GET /api/v1/timetable/classes/{classId}/sections/{sectionId}` | GET | ✅ 200 |
| `POST /api/v1/tenants` | POST | ❌ 403 |
| `POST /api/v1/users` | POST | ❌ 403 |
| `GET /api/v1/fees/students/{id}/assignments` | GET | ❌ 403 |

### 9.3 STUDENT — Allowed vs Forbidden

```bash
# Login as STUDENT
STUDENT_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: greenwood" \
  -d '{"username":"alice.student","password":"StudentPass123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
```

| Endpoint | Method | Expected Status |
|----------|--------|-----------------|
| `GET /api/v1/auth/me` | GET | ✅ 200 (own profile) |
| `GET /api/v1/homework/classes/{classId}` | GET | ✅ 200 |
| `GET /api/v1/timetable/classes/{classId}/sections/{sectionId}` | GET | ✅ 200 |
| `GET /api/v1/exams/classes/{classId}` | GET | ✅ 200 |
| `GET /api/v1/exams/{examId}/results` | GET | ✅ 200 |
| `GET /api/v1/attendances?date=2026-04-28` | GET | ✅ 200 |
| `GET /api/v1/fees/students/{id}/assignments` | GET | ✅ 200 |
| `GET /api/v1/students` | GET | ❌ 403 |
| `POST /api/v1/exams` | POST | ❌ 403 |
| `GET /api/v1/tenants` | GET | ❌ 403 |

### 9.4 PARENT — Allowed vs Forbidden

```bash
# Login as PARENT
PARENT_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: greenwood" \
  -d '{"username":"parent.johnson","password":"ParentPass123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
```

| Endpoint | Method | Expected Status |
|----------|--------|-----------------|
| `GET /api/v1/parents/me/children` | GET | ✅ 200 |
| `GET /api/v1/attendances?date=2026-04-28` | GET | ✅ 200 |
| `GET /api/v1/fees/students/{childId}/assignments` | GET | ✅ 200 |
| `GET /api/v1/exams/{examId}/results` | GET | ✅ 200 |
| `GET /api/v1/homework/classes/{classId}` | GET | ✅ 200 |
| `GET /api/v1/timetable/classes/{classId}/sections/{sectionId}` | GET | ✅ 200 |
| `GET /api/v1/students` | GET | ❌ 403 |
| `POST /api/v1/attendances` | POST | ❌ 403 |
| `GET /api/v1/tenants` | GET | ❌ 403 |

### 9.5 Unauthenticated Access

All endpoints except `POST /api/v1/auth/login` and `GET /api/v1/plans` require a valid JWT:

```bash
# No token → 401
curl -s http://localhost:8080/api/v1/students -H "X-Tenant-Slug: greenwood"
# → { "success": false, "message": "..." }  HTTP 401

# Invalid token → 401
curl -s http://localhost:8080/api/v1/students \
  -H "Authorization: Bearer invalid.token.here" \
  -H "X-Tenant-Slug: greenwood"
# → HTTP 401
```
