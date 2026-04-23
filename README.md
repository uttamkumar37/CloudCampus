# CampusCloud

A multi-tenant SaaS school management backend built with Spring Boot. Each school (tenant) runs in its own isolated PostgreSQL schema. Authentication is JWT-based and every endpoint is protected with role-based access control.

---

## Technology Stack

| Layer | Choice |
|---|---|
| Runtime | Java 17 |
| Framework | Spring Boot 3 |
| Database | PostgreSQL 16 |
| Migrations | Flyway |
| Auth | JWT (stateless) |
| Build | Maven 3 |
| Containers | Docker + Docker Compose |

---

## Architecture

- **Schema-per-tenant** — each tenant gets a dedicated PostgreSQL schema. The schema is selected at runtime via the `X-Tenant-ID` request header.
- **Public schema** — holds the `tenants` table and Flyway migration history.
- **Tenant schema** — holds all domain tables (users, students, teachers, classes, subjects, sections, attendance, fees, exams).
- **Bootstrap admin** — a super-admin account is provisioned from environment variables on startup; no manual SQL needed.

---

## Prerequisites

- Java 17+
- Maven 3.9+
- PostgreSQL 16 (or Docker)

---

## Local Setup (without Docker)

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd CampusCloud
   ```

2. **Create the database**
   ```sql
   CREATE DATABASE campuscloud;
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```
   Then export them or pass them to Maven:
   ```bash
   export $(grep -v '^#' .env | xargs)
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

The app starts on `http://localhost:8080` (or the port in `SERVER_PORT`).

---

## Local Runbook: Reproducible Setup for Development

### Quick Start (Tested Configuration)

If you want to run the backend locally with Swagger and Postman testing, use this exact setup:

#### Step 1: Generate or Use a Valid JWT Secret

The JWT secret must be at least 32 bytes. You can use any of these approaches:

**Option A: Use a Pre-Generated Base64 Secret (Recommended for Testing)**
```bash
JWT_SECRET="MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
```
This is Base64-encoded and exactly 32 bytes when decoded.

**Option B: Generate a New Secret**
```bash
# Generate 32 random bytes and Base64-encode them
JWT_SECRET=$(openssl rand -base64 32)
echo "Use this JWT_SECRET: $JWT_SECRET"
```

**Option C: Use a Plain UTF-8 String (32+ characters)**
```bash
JWT_SECRET="your-32-character-minimum-secret-key-here"
```

#### Step 2: Start PostgreSQL

If using Docker:
```bash
docker run --name campuscloud-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=campuscloud \
  -p 5432:5432 \
  -d postgres:16
```

If using local PostgreSQL:
```bash
# macOS with Homebrew
brew services start postgresql@16

# Linux
sudo systemctl start postgresql

# Or manually create the database
createdb campuscloud
```

#### Step 3: Start the Backend

```bash
# Set environment variables (all on one line or use export)
JWT_SECRET="MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=" \
SPRING_JPA_HIBERNATE_DDL_AUTO=update \
SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/campuscloud" \
SPRING_DATASOURCE_USERNAME=postgres \
SPRING_DATASOURCE_PASSWORD=postgres \
BOOTSTRAP_ADMIN_USERNAME=superadmin \
BOOTSTRAP_ADMIN_PASSWORD=admin@123 \
mvn spring-boot:run
```

Expected output:
```
...
o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path '/'
com.campuscloud.CampusCloudApplication   : Started CampusCloudApplication in X.XXX seconds
```

The backend is now running at `http://localhost:8080`.

---

### Testing with Swagger UI

1. **Access Swagger documentation:**
   ```
   http://localhost:8080/swagger-ui.html
   ```

2. **View OpenAPI schema:**
   ```
   http://localhost:8080/v3/api-docs
   ```

3. **Log in via Swagger:**
   - Expand the **Auth** section
   - Click **POST /api/v1/auth/login**
   - Click **Try it out**
   - Enter request body:
     ```json
     {
       "username": "superadmin",
       "password": "admin@123"
     }
     ```
   - Click **Execute**
   - Copy the `accessToken` from the response
   - Click the **Authorize** button (top-right of Swagger UI)
   - Paste: `Bearer <your-token-here>`
   - Click **Authorize** and then **Close**

4. **Test a secured endpoint:**
   - Expand **Tenant Management**
   - Click **GET /api/v1/tenants**
   - Click **Try it out**
   - In the **X-Tenant-ID** field, enter: `school_1`
   - Click **Execute**
   - Should return `HTTP 200` with an empty tenants list (on fresh startup)

---

### Testing with Postman

#### Import the Collection and Environment

1. **Download the provided Postman artifacts:**
   - Collection: `postman/EduTenant.postman_collection.json`
   - Environment: `postman/EduTenant Local.postman_environment.json`

2. **Import into Postman:**
   - Open Postman
   - Click **File** → **Import**
   - Select the collection JSON file
   - Click **Import**
   - Repeat for the environment JSON file

3. **Select the environment:**
   - Top-right of Postman, find the environment dropdown (currently shows "No Environment")
   - Select **EduTenant Local**

#### Run the Postman Test Sequence

1. **Login Request (Public)**
   - Collection → **Auth** → **POST Login**
   - Click **Send**
   - Response includes `accessToken` which is automatically captured into the `token` variable
   - Check: `HTTP 200`, `success: true`

2. **List Tenants (Secured)**
   - Collection → **Tenant Management** → **GET List All Tenants**
   - Pre-request script automatically includes the Bearer token and `X-Tenant-ID` header
   - Click **Send**
   - Check: `HTTP 200`, `message: "Tenants fetched successfully"`

3. **Create a New Tenant (Optional)**
   - Collection → **Tenant Management** → **POST Create Tenant**
   - Postman pre-fills a sample request body with `tenantId: "school_2"`, `schoolName: "Demo School"`, `schemaName: "school_2"`
   - Click **Send**
   - Check: `HTTP 200`, returns newly created tenant

4. **Create a User in the Tenant**
   - Collection → **User Management** → **POST Create User**
   - Update `X-Tenant-ID` to the tenantId you just created (or use default `school_1`)
   - Postman includes sample request: `fullName, username, email, password, role`
   - Click **Send**
   - Check: `HTTP 200`

#### Example Postman Request Workflow (curl equivalent)

If you prefer curl:

```bash
# Step 1: Login
LOGIN_RESP=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"superadmin","password":"admin@123"}')

# Extract token
TOKEN=$(echo "$LOGIN_RESP" | jq -r '.data.accessToken')
echo "Token: $TOKEN"

# Step 2: List tenants with token
curl -s -X GET http://localhost:8080/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: school_1' \
  -H 'Content-Type: application/json' | jq '.'

# Step 3: Create a new tenant
curl -s -X POST http://localhost:8080/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-ID: public' \
  -H 'Content-Type: application/json' \
  -d '{
    "tenantId": "school_2",
    "schoolName": "Riverside Academy",
    "schemaName": "school_2"
  }' | jq '.'
```

---

### Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| `JWT secret must be at least 32 bytes` | JWT_SECRET is too short | Use `openssl rand -base64 32` to generate a valid 32-byte secret |
| `Connection to localhost:5432 refused` | PostgreSQL not running | Start PostgreSQL: `brew services start postgresql@16` or `docker run ... postgres:16` |
| `ERROR: database "campuscloud" does not exist` | Database not created | Run `createdb campuscloud` or let Docker Compose handle it |
| `Unsupported Database: PostgreSQL XX.XX` | Flyway version mismatch | Ensure `pom.xml` includes `flyway-postgresql` dependency |
| `401 Unauthorized` in Postman | Missing or invalid Bearer token | Login first, copy the token, use Authorize button or update the `token` variable in environment |
| `403 Forbidden` | Insufficient role for endpoint | Use SUPER_ADMIN account or create an account with appropriate role |
| `Building jar: target/campuscloud-1.0-SNAPSHOT.jar` takes long time | First build is slow | Subsequent builds are faster; grab a coffee ☕ |

---

### Environment Variables Reference (for local development)

| Variable | Example Value | Notes |
|---|---|---|
| `JWT_SECRET` | `MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=` | Min 32 bytes; Base64 or UTF-8 |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` | **Local dev only**; use `validate` in production |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/campuscloud` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | DB user |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` | DB password |
| `BOOTSTRAP_ADMIN_USERNAME` | `superadmin` | Auto-created super-admin username |
| `BOOTSTRAP_ADMIN_PASSWORD` | `admin@123` | Auto-created super-admin password |
| `SERVER_PORT` | `8080` | HTTP port (optional; defaults to 8080) |

---

## GitHub Deployment Readiness

This repository is now prepared with GitHub Actions for CI and container publishing.

### Workflows Added

- `.github/workflows/ci.yml`
   - Runs on push and pull request for `main` and `develop`
   - Starts PostgreSQL service in CI
   - Runs `mvn clean verify`

- `.github/workflows/docker-publish.yml`
   - Runs on push to `main`, version tags (`v*`), and manual trigger
   - Builds Docker image from `Dockerfile`
   - Publishes image to GitHub Container Registry (GHCR): `ghcr.io/<owner>/<repo>`

### GitHub Repository Settings Checklist

1. Go to repository settings on GitHub.
2. Ensure Actions permissions allow workflows to run.
3. Ensure package permissions allow pushing to GHCR.

### Recommended GitHub Secrets (for real deployment targets)

If you deploy this image to a cloud host (for example Render, Railway, EC2, Azure, or Kubernetes), configure these secrets in your deployment platform:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_ACCESS_TOKEN_EXPIRATION_MS`
- `BOOTSTRAP_ADMIN_USERNAME`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_ADMIN_ROLE`

### Release Flow

1. Push feature branch and open a pull request.
2. Wait for CI workflow to pass.
3. Merge into `main`.
4. Docker image is automatically published to GHCR.
5. (Optional) Create tag like `v1.0.0` to publish versioned image tag.

---

## Docker Setup (recommended)

1. **Copy and configure secrets**
   ```bash
   cp .env.example .env
   # Edit .env — especially JWT_SECRET, DB_PASSWORD, BOOTSTRAP_ADMIN_PASSWORD
   # Generate a secure JWT secret:
   openssl rand -hex 32
   ```

2. **Start all services**
   ```bash
   docker compose up --build
   ```

3. **Stop all services**
   ```bash
   docker compose down
   ```

4. **Stop and remove volumes (wipes database)**
   ```bash
   docker compose down -v
   ```

---

## Environment Variables

All secrets are loaded from a `.env` file (not committed to git). Copy `.env.example` to `.env` and fill in your values.

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_DB` | — | PostgreSQL database name |
| `DB_USERNAME` | — | PostgreSQL username |
| `DB_PASSWORD` | — | PostgreSQL password |
| `SERVER_PORT` | `8080` | HTTP port |
| `JWT_SECRET` | — | HS256 signing key, min 32 bytes |
| `JWT_ACCESS_TOKEN_EXPIRATION_MS` | `3600000` | Token TTL in milliseconds (1 hour) |
| `BOOTSTRAP_ADMIN_USERNAME` | — | Super-admin username |
| `BOOTSTRAP_ADMIN_PASSWORD` | — | Super-admin password |
| `BOOTSTRAP_ADMIN_ROLE` | `SUPER_ADMIN` | Role assigned to bootstrap admin |

---

## API Reference

All endpoints are prefixed with `/api/v1`. Every request (except auth) must include:
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-schema-name>` (not required for tenant management or auth endpoints that operate on the public schema)

### Roles

| Role | Description |
|---|---|
| `SUPER_ADMIN` | Platform-level admin; manages tenants and can access all endpoints |
| `SCHOOL_ADMIN` | School-level admin; manages users, students, teachers, academics, fees |
| `TEACHER` | Can read students, mark attendance, view exams |
| `STUDENT` | Can view their own exam results |
| `PARENT` | Can view fee assignments for their child |

---

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Obtain a JWT token |

**Login request body:**
```json
{
  "username": "superadmin",
  "password": "your-password"
}
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "token": "<jwt>" },
  "timestamp": "..."
}
```

---

### Tenant Management (`SUPER_ADMIN` only)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/tenants` | Create a new tenant (provisions schema + all tables) |
| `GET` | `/api/v1/tenants` | List all tenants |
| `GET` | `/api/v1/tenants/{tenantId}` | Get a single tenant |

**Create tenant request:**
```json
{
  "name": "Greenwood High",
  "schemaName": "greenwood"
}
```

---

### Users (`SUPER_ADMIN`, `SCHOOL_ADMIN`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/users` | Create a user in the tenant schema |
| `GET` | `/api/v1/users` | List users |

---

### Students

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/api/v1/students` | SUPER_ADMIN, SCHOOL_ADMIN | Enroll a student |
| `GET` | `/api/v1/students` | + TEACHER | List all students |
| `GET` | `/api/v1/students/{id}` | + TEACHER | Get a student by ID |

---

### Teachers

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/api/v1/teachers` | SUPER_ADMIN, SCHOOL_ADMIN | Add a teacher |
| `GET` | `/api/v1/teachers` | + TEACHER | List all teachers |
| `GET` | `/api/v1/teachers/{id}` | + TEACHER | Get a teacher by ID |

---

### Academics (Classes, Subjects, Sections)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/api/v1/academics/classes` | SUPER_ADMIN, SCHOOL_ADMIN | Create a class |
| `GET` | `/api/v1/academics/classes` | + TEACHER | List classes |
| `POST` | `/api/v1/academics/subjects` | SUPER_ADMIN, SCHOOL_ADMIN | Create a subject |
| `GET` | `/api/v1/academics/subjects` | + TEACHER | List subjects |
| `POST` | `/api/v1/academics/sections` | SUPER_ADMIN, SCHOOL_ADMIN | Create a section |
| `GET` | `/api/v1/academics/sections` | + TEACHER | List sections |

---

### Attendance

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/api/v1/attendances` | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER | Mark attendance |
| `GET` | `/api/v1/attendances/{id}` | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER | Get record by ID |
| `GET` | `/api/v1/attendances?date=YYYY-MM-DD` | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER | Get records by date |

---

### Fees

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/api/v1/fees/assignments` | SUPER_ADMIN, SCHOOL_ADMIN | Assign a fee to a student |
| `POST` | `/api/v1/fees/payments` | SUPER_ADMIN, SCHOOL_ADMIN | Record a fee payment |
| `GET` | `/api/v1/fees/students/{studentId}/assignments` | + PARENT | Get fee assignments for a student |

---

### Exams & Results

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/api/v1/exams` | SUPER_ADMIN, SCHOOL_ADMIN | Schedule an exam |
| `GET` | `/api/v1/exams/classes/{classId}` | + TEACHER, STUDENT, PARENT | List exams for a class |
| `POST` | `/api/v1/exams/results` | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER | Enter an exam result |
| `GET` | `/api/v1/exams/{examId}/results` | + STUDENT, PARENT | Get results for an exam |

---

## Error Responses

All error responses follow the same shape:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "data": null,
  "timestamp": "2026-04-23T10:00:00Z"
}
```

| HTTP Status | Cause |
|---|---|
| `400` | Validation failure or business rule violation |
| `401` | Missing or invalid JWT |
| `403` | Authenticated but insufficient role |
| `500` | Unexpected server error |

---

## Project Structure

```
src/main/java/com/campuscloud/
├── auth/           # JWT filter, login endpoint, DatabaseUserDetailsService
├── common/         # ApiResponse record, GlobalExceptionHandler
├── config/         # SecurityConfig, Flyway config
├── tenant/         # Tenant entity, TenantController, TenantServiceImpl
├── user/           # UserAccount, UserRole, UserController
├── student/        # Student, Gender, StudentController
├── teacher/        # Teacher, TeacherController
├── academic/       # SchoolClass, Subject, Section, AcademicController
├── attendance/     # AttendanceRecord, AttendanceStatus, AttendanceController
├── fees/           # FeeAssignment, FeePayment, FeeStatus, FeesController
└── exam/           # Exam, ExamResult, ExamController
```
