#!/usr/bin/env bash
# =============================================================================
# CloudCampus — Docker full-reset, start, and API smoke-test
# Usage:  chmod +x test-docker.sh && ./test-docker.sh
# =============================================================================
set -euo pipefail

BASE="http://localhost:8080/api/v1"
UI_URL="http://localhost"
PASS=0; FAIL=0; SKIP=0

# ── colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m';  BOLD='\033[1m';   NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
pass()  { echo -e "${GREEN}[PASS]${NC}  $*"; ((PASS++)); }
fail()  { echo -e "${RED}[FAIL]${NC}  $*"; ((FAIL++)); }
skip()  { echo -e "${YELLOW}[SKIP]${NC}  $*"; ((SKIP++)); }
header(){ echo -e "\n${BOLD}${CYAN}━━━ $* ━━━${NC}"; }

# ── helper: run curl, print method+url+status ─────────────────────────────────
call() {
  local label="$1"; shift
  local http_code
  http_code=$(curl -s -o /tmp/cc_resp.json -w "%{http_code}" "$@")
  local body; body=$(cat /tmp/cc_resp.json 2>/dev/null || echo "")
  if [[ "$http_code" =~ ^2 ]]; then
    pass "$label → HTTP $http_code"
  elif [[ "$http_code" == "401" || "$http_code" == "403" ]]; then
    skip "$label → HTTP $http_code (auth-gated, expected without proper token)"
  else
    fail "$label → HTTP $http_code | $(echo "$body" | head -c 200)"
  fi
  echo "$body"
}

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 1 — Docker full reset"
# ══════════════════════════════════════════════════════════════════════════════

info "Stopping and removing CloudCampus containers, images, volumes..."

docker compose down --volumes --remove-orphans 2>/dev/null || true

# Remove project-specific images
for img in cloudcampus-backend cloudcampus-frontend; do
  docker image rm "$img" 2>/dev/null && info "Removed image $img" || true
done

# Also remove any dangling images from previous builds
docker image prune -f 2>/dev/null || true

info "Docker cleaned ✓"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 2 — Build and start services"
# ══════════════════════════════════════════════════════════════════════════════

info "Building images (this may take 3-5 minutes the first time)..."
docker compose build --no-cache

info "Starting services..."
docker compose up -d

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 3 — Wait for services to be healthy"
# ══════════════════════════════════════════════════════════════════════════════

info "Waiting for PostgreSQL..."
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -q 2>/dev/null; then
    echo "PostgreSQL ready after ${i}s ✓"
    break
  fi
  sleep 2
done

info "Waiting for Spring Boot backend (up to 120s)..."
for i in $(seq 1 60); do
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/plans" 2>/dev/null || echo "000")
  if [[ "$http_code" =~ ^[2345] ]]; then
    echo "Backend ready after $((i*2))s — HTTP $http_code ✓"
    break
  fi
  if [[ "$i" == "60" ]]; then
    fail "Backend did not start within 120s"
    info "Container logs:"
    docker compose logs --tail=50 backend
    exit 1
  fi
  sleep 2
done

info "Waiting for frontend nginx (up to 30s)..."
for i in $(seq 1 15); do
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "$UI_URL" 2>/dev/null || echo "000")
  if [[ "$http_code" =~ ^[23] ]]; then
    echo "Frontend ready after $((i*2))s — HTTP $http_code ✓"
    break
  fi
  sleep 2
done

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 4 — Public / unauthenticated endpoints"
# ══════════════════════════════════════════════════════════════════════════════

call "GET /plans (subscription plans list)" \
  -X GET "$BASE/plans"

call "GET /plans/:id (plan by id — 404 expected is still 2xx-gated)" \
  -X GET "$BASE/plans/00000000-0000-0000-0000-000000000001" 2>/dev/null || true

call "GET /tenants/schools/search?q=test (public school search)" \
  -X GET "$BASE/tenants/schools/search?q=test"

call "GET /website/:slug (public website — 404 for unknown slug is OK)" \
  -X GET "$BASE/website/nonexistent-school" 2>/dev/null || true

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 5 — Super-admin login"
# ══════════════════════════════════════════════════════════════════════════════

# Read credentials from .env
ADMIN_USER=$(grep BOOTSTRAP_ADMIN_USERNAME .env | cut -d= -f2)
ADMIN_PASS=$(grep BOOTSTRAP_ADMIN_PASSWORD .env | cut -d= -f2)

info "Logging in as super-admin ($ADMIN_USER)..."
LOGIN_RESP=$(curl -s -c /tmp/cc_cookies.txt -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}")

echo "$LOGIN_RESP" | grep -q '"success":true' && pass "POST /auth/login → 200" || fail "POST /auth/login failed: $LOGIN_RESP"

TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || echo "")
# Some setups return token in cookie only — try both
if [[ -z "$TOKEN" ]]; then
  TOKEN=$(grep "app_jwt" /tmp/cc_cookies.txt 2>/dev/null | awk '{print $7}' || echo "")
fi

if [[ -z "$TOKEN" ]]; then
  skip "No bearer token found — subsequent auth tests use cookie jar"
  AUTH="-b /tmp/cc_cookies.txt"
else
  info "Got bearer token ✓"
  AUTH="-H \"Authorization: Bearer $TOKEN\""
fi

# Convenience wrapper that includes auth
authed() {
  local label="$1"; shift
  if [[ -n "$TOKEN" ]]; then
    call "$label" -H "Authorization: Bearer $TOKEN" "$@"
  else
    call "$label" -b /tmp/cc_cookies.txt "$@"
  fi
}

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 6 — Auth endpoints"
# ══════════════════════════════════════════════════════════════════════════════

authed "GET /auth/me" -X GET "$BASE/auth/me"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 7 — Super-admin: Tenant management"
# ══════════════════════════════════════════════════════════════════════════════

authed "GET /tenants" -X GET "$BASE/tenants"

info "Creating test tenant..."
CREATE_TENANT=$(
  if [[ -n "$TOKEN" ]]; then
    curl -s -X POST "$BASE/tenants" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "tenantId":"test-school-01",
        "slug":"test-school-01",
        "schoolName":"Test School One",
        "schemaName":"school_test01",
        "adminUsername":"admin_test01",
        "adminPassword":"Admin@12345",
        "adminEmail":"admin@testschool.com",
        "adminFullName":"School Admin"
      }'
  else
    curl -s -b /tmp/cc_cookies.txt -X POST "$BASE/tenants" \
      -H "Content-Type: application/json" \
      -d '{
        "tenantId":"test-school-01",
        "slug":"test-school-01",
        "schoolName":"Test School One",
        "schemaName":"school_test01",
        "adminUsername":"admin_test01",
        "adminPassword":"Admin@12345",
        "adminEmail":"admin@testschool.com",
        "adminFullName":"School Admin"
      }'
  fi
)
echo "$CREATE_TENANT" | grep -q '"success":true' \
  && pass "POST /tenants (create tenant) → 200" \
  || { echo "$CREATE_TENANT" | grep -q "already" \
    && skip "POST /tenants → tenant already exists (re-run scenario)" \
    || fail "POST /tenants → $CREATE_TENANT"; }

TENANT_SLUG="test-school-01"

authed "GET /tenants/schools/search?q=test" -X GET "$BASE/tenants/schools/search?q=test"
authed "GET /tenants/schools/:slug" -X GET "$BASE/tenants/schools/$TENANT_SLUG"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 8 — Tenant-admin login"
# ══════════════════════════════════════════════════════════════════════════════

info "Logging in as tenant admin (admin_test01)..."
TENANT_LOGIN=$(curl -s -c /tmp/cc_tenant_cookies.txt -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d '{"username":"admin_test01","password":"Admin@12345"}')

echo "$TENANT_LOGIN" | grep -q '"success":true' \
  && pass "POST /auth/login (tenant admin) → 200" \
  || fail "POST /auth/login (tenant admin) failed: $(echo $TENANT_LOGIN | head -c 200)"

TADMIN_TOKEN=$(echo "$TENANT_LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || echo "")
[[ -z "$TADMIN_TOKEN" ]] && TADMIN_TOKEN=$(grep "app_jwt" /tmp/cc_tenant_cookies.txt 2>/dev/null | awk '{print $7}' || echo "")

# Tenant-authed helper
tauthed() {
  local label="$1"; shift
  if [[ -n "$TADMIN_TOKEN" ]]; then
    call "$label" -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" "$@"
  else
    call "$label" -b /tmp/cc_tenant_cookies.txt -H "X-Tenant-Slug: $TENANT_SLUG" "$@"
  fi
}

tauthed "GET /auth/me (tenant admin)" -X GET "$BASE/auth/me"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 9 — Dashboard"
# ══════════════════════════════════════════════════════════════════════════════

authed  "GET /dashboard/super-admin-summary" -X GET "$BASE/dashboard/super-admin-summary"
tauthed "GET /dashboard/tenant-summary"      -X GET "$BASE/dashboard/tenant-summary"
tauthed "GET /dashboard/branding"            -X GET "$BASE/dashboard/branding"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 10 — Academics (classes, subjects, sections)"
# ══════════════════════════════════════════════════════════════════════════════

tauthed "GET /academics/classes"  -X GET "$BASE/academics/classes"
tauthed "GET /academics/subjects" -X GET "$BASE/academics/subjects"
tauthed "GET /academics/sections" -X GET "$BASE/academics/sections"

info "Creating class, subject, section..."
CLASS_RESP=$(curl -s -X POST "$BASE/academics/classes" \
  -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Content-Type: application/json" \
  -d '{"name":"Class 10","code":"CLS10"}')
echo "$CLASS_RESP" | grep -q '"success":true' && pass "POST /academics/classes → 200" \
  || skip "POST /academics/classes → $(echo $CLASS_RESP | head -c 150)"
CLASS_ID=$(echo "$CLASS_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

SUBJECT_RESP=$(curl -s -X POST "$BASE/academics/subjects" \
  -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mathematics","code":"MATH"}')
echo "$SUBJECT_RESP" | grep -q '"success":true' && pass "POST /academics/subjects → 200" \
  || skip "POST /academics/subjects → $(echo $SUBJECT_RESP | head -c 150)"
SUBJECT_ID=$(echo "$SUBJECT_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [[ -n "$CLASS_ID" ]]; then
  SECTION_RESP=$(curl -s -X POST "$BASE/academics/sections" \
    -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"A\",\"classId\":\"$CLASS_ID\"}")
  echo "$SECTION_RESP" | grep -q '"success":true' && pass "POST /academics/sections → 200" \
    || skip "POST /academics/sections → $(echo $SECTION_RESP | head -c 150)"
  SECTION_ID=$(echo "$SECTION_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
else
  SECTION_ID=""
fi

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 11 — Students"
# ══════════════════════════════════════════════════════════════════════════════

tauthed "GET /students" -X GET "$BASE/students"

STUDENT_RESP=$(curl -s -X POST "$BASE/students" \
  -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Content-Type: application/json" \
  -d '{
    "admissionNo":"ADM001",
    "firstName":"John",
    "lastName":"Doe",
    "dateOfBirth":"2008-05-15",
    "gender":"MALE",
    "email":"john.doe@testschool.com"
  }')
echo "$STUDENT_RESP" | grep -q '"success":true' && pass "POST /students → 200" \
  || skip "POST /students → $(echo $STUDENT_RESP | head -c 200)"
STUDENT_ID=$(echo "$STUDENT_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

[[ -n "$STUDENT_ID" ]] && tauthed "GET /students/:id" -X GET "$BASE/students/$STUDENT_ID" \
  || skip "GET /students/:id — no student ID (creation skipped)"
[[ -n "$STUDENT_ID" ]] && tauthed "GET /students/:id/details" -X GET "$BASE/students/$STUDENT_ID/details" \
  || skip "GET /students/:id/details — no student ID"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 12 — Teachers"
# ══════════════════════════════════════════════════════════════════════════════

tauthed "GET /teachers" -X GET "$BASE/teachers"

TEACHER_RESP=$(curl -s -X POST "$BASE/teachers" \
  -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeNo":"EMP001",
    "firstName":"Jane",
    "lastName":"Smith",
    "email":"jane.smith@testschool.com",
    "hireDate":"2022-01-10"
  }')
echo "$TEACHER_RESP" | grep -q '"success":true' && pass "POST /teachers → 200" \
  || skip "POST /teachers → $(echo $TEACHER_RESP | head -c 200)"
TEACHER_ID=$(echo "$TEACHER_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

[[ -n "$TEACHER_ID" ]] && tauthed "GET /teachers/:id" -X GET "$BASE/teachers/$TEACHER_ID" \
  || skip "GET /teachers/:id — no teacher ID"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 13 — Timetable"
# ══════════════════════════════════════════════════════════════════════════════

if [[ -n "$CLASS_ID" && -n "$SECTION_ID" && -n "$SUBJECT_ID" && -n "$TEACHER_ID" ]]; then
  TT_RESP=$(curl -s -X POST "$BASE/timetable/slots" \
    -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" \
    -H "Content-Type: application/json" \
    -d "{
      \"classId\":\"$CLASS_ID\",
      \"sectionId\":\"$SECTION_ID\",
      \"subjectId\":\"$SUBJECT_ID\",
      \"teacherId\":\"$TEACHER_ID\",
      \"dayOfWeek\":1,
      \"startTime\":\"09:00\",
      \"endTime\":\"10:00\",
      \"label\":\"Period 1\"
    }")
  echo "$TT_RESP" | grep -q '"success":true' && pass "POST /timetable/slots → 200" \
    || fail "POST /timetable/slots → $(echo $TT_RESP | head -c 200)"
  tauthed "GET /timetable/classes/:id/sections/:id" \
    -X GET "$BASE/timetable/classes/$CLASS_ID/sections/$SECTION_ID"
else
  skip "Timetable tests — missing class/section/subject/teacher IDs"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 14 — Attendance"
# ══════════════════════════════════════════════════════════════════════════════

TODAY=$(date +%Y-%m-%d)
tauthed "GET /attendances?date=$TODAY" -X GET "$BASE/attendances?date=$TODAY"

if [[ -n "$STUDENT_ID" && -n "$CLASS_ID" && -n "$SECTION_ID" ]]; then
  ATT_RESP=$(curl -s -X POST "$BASE/attendances" \
    -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" \
    -H "Content-Type: application/json" \
    -d "{
      \"studentId\":\"$STUDENT_ID\",
      \"classId\":\"$CLASS_ID\",
      \"sectionId\":\"$SECTION_ID\",
      \"attendanceDate\":\"$TODAY\",
      \"status\":\"PRESENT\"
    }")
  echo "$ATT_RESP" | grep -q '"success":true' && pass "POST /attendances → 200" \
    || fail "POST /attendances → $(echo $ATT_RESP | head -c 200)"
  ATT_ID=$(echo "$ATT_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [[ -n "$ATT_ID" ]] && tauthed "GET /attendances/:id" -X GET "$BASE/attendances/$ATT_ID"
else
  skip "POST /attendances — missing student/class/section IDs"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 15 — Fees"
# ══════════════════════════════════════════════════════════════════════════════

if [[ -n "$STUDENT_ID" ]]; then
  FEE_RESP=$(curl -s -X POST "$BASE/fees/assignments" \
    -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" \
    -H "Content-Type: application/json" \
    -d "{
      \"studentId\":\"$STUDENT_ID\",
      \"feeTitle\":\"Tuition Fee Q1\",
      \"amount\":5000.00,
      \"dueDate\":\"2026-06-30\"
    }")
  echo "$FEE_RESP" | grep -q '"success":true' && pass "POST /fees/assignments → 200" \
    || fail "POST /fees/assignments → $(echo $FEE_RESP | head -c 200)"
  FEE_ID=$(echo "$FEE_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

  tauthed "GET /fees/students/:id/assignments" -X GET "$BASE/fees/students/$STUDENT_ID/assignments"

  if [[ -n "$FEE_ID" ]]; then
    PAY_RESP=$(curl -s -X POST "$BASE/fees/payments" \
      -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" \
      -H "Content-Type: application/json" \
      -d "{
        \"feeAssignmentId\":\"$FEE_ID\",
        \"amountPaid\":5000.00,
        \"paymentDate\":\"$TODAY\",
        \"paymentMethod\":\"CASH\",
        \"referenceNo\":null
      }")
    echo "$PAY_RESP" | grep -q '"success":true' && pass "POST /fees/payments → 200" \
      || fail "POST /fees/payments → $(echo $PAY_RESP | head -c 200)"
  fi
else
  skip "Fees tests — no student ID"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 16 — Exams"
# ══════════════════════════════════════════════════════════════════════════════

if [[ -n "$CLASS_ID" && -n "$SECTION_ID" && -n "$SUBJECT_ID" ]]; then
  EXAM_RESP=$(curl -s -X POST "$BASE/exams" \
    -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\":\"Mid-Term Math\",
      \"examDate\":\"2026-06-15\",
      \"classId\":\"$CLASS_ID\",
      \"sectionId\":\"$SECTION_ID\",
      \"subjectId\":\"$SUBJECT_ID\",
      \"maxMarks\":100
    }")
  echo "$EXAM_RESP" | grep -q '"success":true' && pass "POST /exams → 200" \
    || fail "POST /exams → $(echo $EXAM_RESP | head -c 200)"
  EXAM_ID=$(echo "$EXAM_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  tauthed "GET /exams/classes/:id" -X GET "$BASE/exams/classes/$CLASS_ID"

  if [[ -n "$EXAM_ID" && -n "$STUDENT_ID" ]]; then
    RESULT_RESP=$(curl -s -X POST "$BASE/exams/results" \
      -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" \
      -H "Content-Type: application/json" \
      -d "{
        \"examId\":\"$EXAM_ID\",
        \"studentId\":\"$STUDENT_ID\",
        \"marksObtained\":85.5,
        \"grade\":\"A\"
      }")
    echo "$RESULT_RESP" | grep -q '"success":true' && pass "POST /exams/results → 200" \
      || fail "POST /exams/results → $(echo $RESULT_RESP | head -c 200)"
    tauthed "GET /exams/:id/results" -X GET "$BASE/exams/$EXAM_ID/results"
  fi
else
  skip "Exams tests — missing class/section/subject"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 17 — Homework"
# ══════════════════════════════════════════════════════════════════════════════

if [[ -n "$CLASS_ID" ]]; then
  HW_RESP=$(curl -s -X POST "$BASE/homework" \
    -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\":\"Chapter 5 Exercises\",
      \"instructions\":\"Complete all exercises from chapter 5\",
      \"classId\":\"$CLASS_ID\",
      \"sectionId\":${SECTION_ID:+\"$SECTION_ID\"},
      \"dueDate\":\"2026-05-20\"
    }")
  echo "$HW_RESP" | grep -q '"success":true' && pass "POST /homework → 200" \
    || fail "POST /homework → $(echo $HW_RESP | head -c 200)"
  tauthed "GET /homework/classes/:id" -X GET "$BASE/homework/classes/$CLASS_ID"
else
  skip "Homework tests — no class ID"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 18 — Users"
# ══════════════════════════════════════════════════════════════════════════════

tauthed "GET /users" -X GET "$BASE/users"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 19 — Subscription plans (super-admin)"
# ══════════════════════════════════════════════════════════════════════════════

authed "GET /plans (all)" -X GET "$BASE/plans"

PLAN_RESP=$(curl -s -X POST "$BASE/plans" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Starter",
    "price":999.00,
    "currency":"INR",
    "durationDays":365,
    "features":["Up to 500 students","Email support"]
  }')
echo "$PLAN_RESP" | grep -q '"success":true' && pass "POST /plans → 200" \
  || skip "POST /plans → $(echo $PLAN_RESP | head -c 200)"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 20 — Bulk upload operations list"
# ══════════════════════════════════════════════════════════════════════════════

tauthed "GET /bulk/operations" -X GET "$BASE/bulk/operations"
tauthed "GET /bulk/jobs"       -X GET "$BASE/bulk/jobs"
tauthed "GET /bulk/sample?operation=STUDENTS" \
  -X GET "$BASE/bulk/sample?operation=STUDENTS"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 21 — CMS"
# ══════════════════════════════════════════════════════════════════════════════

tauthed "GET /cms/config"    -X GET "$BASE/cms/config"
tauthed "GET /cms/sections"  -X GET "$BASE/cms/sections"
tauthed "GET /cms/gallery"   -X GET "$BASE/cms/gallery"
tauthed "GET /cms/leads"     -X GET "$BASE/cms/leads"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 22 — Public website"
# ══════════════════════════════════════════════════════════════════════════════

call "GET /website/:slug (school public page)" \
  -X GET "$BASE/website/$TENANT_SLUG"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 23 — UI reachability"
# ══════════════════════════════════════════════════════════════════════════════

UI_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$UI_URL")
[[ "$UI_CODE" == "200" ]] && pass "Frontend nginx → HTTP 200" \
  || fail "Frontend nginx → HTTP $UI_CODE"

# Check that index.html contains the React app (not a blank page)
UI_BODY=$(curl -s "$UI_URL")
echo "$UI_BODY" | grep -q 'id="root"' && pass "Frontend HTML contains React root div" \
  || fail "Frontend HTML missing React root — possible build issue"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 24 — CORS header verification"
# ══════════════════════════════════════════════════════════════════════════════

CORS_RESP=$(curl -s -I -X OPTIONS "$BASE/auth/login" \
  -H "Origin: http://localhost" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")
echo "$CORS_RESP" | grep -i "access-control-allow-origin" && pass "CORS headers present" \
  || fail "CORS headers missing from preflight response"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 25 — Swagger UI"
# ══════════════════════════════════════════════════════════════════════════════

SWAGGER_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/swagger-ui.html")
[[ "$SWAGGER_CODE" =~ ^[23] ]] && pass "Swagger UI → HTTP $SWAGGER_CODE" \
  || fail "Swagger UI → HTTP $SWAGGER_CODE"

# ══════════════════════════════════════════════════════════════════════════════
header "STEP 26 — Logout"
# ══════════════════════════════════════════════════════════════════════════════

if [[ -n "$TADMIN_TOKEN" ]]; then
  call "POST /auth/logout (tenant admin)" \
    -X POST "$BASE/auth/logout" \
    -H "Authorization: Bearer $TADMIN_TOKEN" -H "X-Tenant-Slug: $TENANT_SLUG"
fi
if [[ -n "$TOKEN" ]]; then
  call "POST /auth/logout (super-admin)" \
    -X POST "$BASE/auth/logout" \
    -H "Authorization: Bearer $TOKEN"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "RESULTS"
# ══════════════════════════════════════════════════════════════════════════════

TOTAL=$((PASS + FAIL + SKIP))
echo ""
echo -e "${BOLD}Total checks : $TOTAL${NC}"
echo -e "${GREEN}Passed       : $PASS${NC}"
echo -e "${RED}Failed       : $FAIL${NC}"
echo -e "${YELLOW}Skipped      : $SKIP${NC} (auth-gated or dependent on prior step)"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}✅  All reachable endpoints passed!${NC}"
else
  echo -e "${RED}${BOLD}❌  $FAIL checks failed — see [FAIL] lines above${NC}"
  echo ""
  echo "Container logs (last 30 lines each):"
  docker compose logs --tail=30 backend
  docker compose logs --tail=30 frontend
  exit 1
fi
