#!/usr/bin/env python3
"""
CloudCampus Enterprise Documentation Generator
Generates CloudCampus_Enterprise_Documentation.pdf covering all 50 topics.
Requires: pip3 install fpdf2
"""

from fpdf import FPDF
from fpdf.enums import XPos, YPos
import os, datetime

# ?? Color palette ??????????????????????????????????????????????????????????????
NAVY   = (15,  52,  96)   # primary heading
BLUE   = (30,  90, 160)   # section heading
TEAL   = (0,  128, 128)   # sub-heading accent
GRAY   = (80,  80,  80)   # body text
LGRAY  = (240, 242, 245)  # code block background
WHITE  = (255, 255, 255)
ORANGE = (214, 122,  28)  # accent / callout
GREEN  = (39,  174,  96)  # healthy indicator
RED    = (192,  57,  43)  # warning indicator
DKGRAY = (50,  50,  50)   # footer text

OUTPUT = os.path.join(os.path.dirname(__file__), "CloudCampus_Enterprise_Documentation.pdf")


class Doc(FPDF):
    def __init__(self):
        super().__init__("P", "mm", "A4")
        self.set_auto_page_break(auto=True, margin=20)
        self.set_margins(20, 20, 20)
        self._toc = []          # (title, page)
        self._section_num = 0

    # ?? Header / Footer ????????????????????????????????????????????????????????

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(*NAVY)
        self.cell(0, 6, "CloudCampus -- Enterprise Documentation", align="L",
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_draw_color(*BLUE)
        self.set_line_width(0.4)
        self.line(20, self.get_y(), 190, self.get_y())
        self.ln(2)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-15)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*DKGRAY)
        self.cell(0, 5, f"© 2026 CloudCampus -- Confidential & Proprietary   |   Page {self.page_no()}",
                  align="C")

    # ?? Helpers ????????????????????????????????????????????????????????????????

    def h1(self, text):
        """Chapter/section heading -- registers in TOC."""
        self._section_num += 1
        label = f"{self._section_num}. {text}"
        self._toc.append((label, self.page_no()))
        self.ln(4)
        self.set_fill_color(*NAVY)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 13)
        self.cell(0, 9, f"  {label}", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_text_color(*GRAY)
        self.ln(3)

    def h2(self, text):
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*BLUE)
        self.cell(0, 7, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_draw_color(*TEAL)
        self.set_line_width(0.3)
        self.line(20, self.get_y(), 100, self.get_y())
        self.ln(2)
        self.set_text_color(*GRAY)

    def h3(self, text):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*TEAL)
        self.cell(0, 6, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_text_color(*GRAY)

    def body(self, text):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*GRAY)
        self.multi_cell(0, 5, text)
        self.ln(1)

    def bullet(self, items):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*GRAY)
        indent = 7
        for item in items:
            self.cell(indent, 5, "-", new_x=XPos.RIGHT, new_y=YPos.TOP)
            txt_w = self.w - self.r_margin - self.l_margin - indent
            self.multi_cell(txt_w, 5, item)
        self.ln(1)

    def code(self, text, label=""):
        if label:
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(*TEAL)
            self.cell(0, 5, label, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_fill_color(*LGRAY)
        self.set_font("Courier", "", 8)
        self.set_text_color(*DKGRAY)
        self.set_draw_color(200, 200, 200)
        self.multi_cell(0, 4.5, text, border=1, fill=True)
        self.set_text_color(*GRAY)
        self.ln(2)

    def callout(self, text, color=ORANGE):
        self.set_fill_color(*color)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 9)
        self.multi_cell(0, 5.5, f"  {text}", fill=True)
        self.set_text_color(*GRAY)
        self.ln(2)

    def table(self, headers, rows, col_widths=None):
        if col_widths is None:
            w = 170 // len(headers)
            col_widths = [w] * len(headers)
        # header row
        self.set_fill_color(*NAVY)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 8.5)
        for h, w in zip(headers, col_widths):
            self.cell(w, 7, h, border=1, fill=True, align="C")
        self.ln()
        # data rows
        self.set_font("Helvetica", "", 8.5)
        for ri, row in enumerate(rows):
            self.set_fill_color(248, 250, 252) if ri % 2 == 0 else self.set_fill_color(*WHITE)
            self.set_text_color(*GRAY)
            for val, w in zip(row, col_widths):
                self.cell(w, 6, str(val), border=1, fill=True)
            self.ln()
        self.ln(3)

    def spacer(self, h=4):
        self.ln(h)


# ?? Cover page ?????????????????????????????????????????????????????????????????

def cover(doc: Doc):
    doc.add_page()
    doc.set_fill_color(*NAVY)
    doc.rect(0, 0, 210, 297, "F")

    doc.set_y(55)
    doc.set_font("Helvetica", "B", 38)
    doc.set_text_color(*WHITE)
    doc.cell(0, 18, "CloudCampus", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    doc.set_font("Helvetica", "", 16)
    doc.set_text_color(180, 210, 255)
    doc.cell(0, 10, "Multi-Tenant SaaS School Management Platform", align="C",
             new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    doc.ln(10)
    doc.set_fill_color(*ORANGE)
    doc.rect(40, doc.get_y(), 130, 1.2, "F")
    doc.ln(12)

    doc.set_font("Helvetica", "B", 22)
    doc.set_text_color(*WHITE)
    doc.cell(0, 12, "Enterprise Documentation", align="C",
             new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    doc.set_font("Helvetica", "", 12)
    doc.set_text_color(200, 220, 255)
    doc.cell(0, 8, "Infrastructure · Architecture · Monitoring · Operations · Security",
             align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    doc.ln(20)

    # Info box
    doc.set_fill_color(25, 65, 115)
    doc.rect(35, doc.get_y(), 140, 52, "F")
    doc.set_y(doc.get_y() + 6)
    items = [
        ("Version",     "1.0.0 -- Production Release"),
        ("Platform",    "Spring Boot 3.4 · Java 21 · React · React Native"),
        ("Database",    "PostgreSQL 16 + Redis + RabbitMQ"),
        ("Tenancy",     "Multi-Tenant SaaS · Enterprise-Grade"),
        ("Prepared for","Customer Demos · Investors · Engineering"),
        ("Generated",   datetime.date.today().strftime("%d %B %Y")),
    ]
    for k, v in items:
        doc.set_font("Helvetica", "B", 9)
        doc.set_text_color(160, 200, 255)
        doc.cell(45, 6, f"  {k}:", new_x=XPos.RIGHT, new_y=YPos.TOP)
        doc.set_font("Helvetica", "", 9)
        doc.set_text_color(*WHITE)
        doc.cell(0, 6, v, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    doc.ln(25)
    doc.set_font("Helvetica", "I", 9)
    doc.set_text_color(120, 160, 210)
    doc.cell(0, 6, "CONFIDENTIAL -- For authorized personnel only", align="C")


# ?? TOC placeholder (written after all pages are created) ?????????????????????

def toc_page(doc: Doc):
    doc.add_page()
    doc.set_font("Helvetica", "B", 18)
    doc.set_text_color(*NAVY)
    doc.cell(0, 12, "Table of Contents", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    doc.set_draw_color(*BLUE)
    doc.set_line_width(0.5)
    doc.line(20, doc.get_y(), 190, doc.get_y())
    doc.ln(4)
    # TOC entries written after pages are built -- placeholder text
    doc.set_font("Helvetica", "", 9)
    doc.set_text_color(*GRAY)
    doc.cell(0, 5, "(See section index below)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    doc.ln(2)
    return doc.page_no()


# ??????????????????????????????????????????????????????????????????????????????
# SECTION CONTENT
# ??????????????????????????????????????????????????????????????????????????????

def s01_platform_overview(doc: Doc):
    doc.add_page()
    doc.h1("Platform Overview")
    doc.body(
        "CloudCampus is an enterprise-grade, multi-tenant SaaS School Management Platform "
        "built on Spring Boot 3.4 and Java 21. It provides a complete digital backbone for "
        "K-12 schools, from admissions and academics to finance, communication, and AI-powered insights."
    )
    doc.h2("Core Value Proposition")
    doc.bullet([
        "Multi-tenant architecture -- one platform, unlimited schools",
        "Enterprise subscription model with granular feature flags",
        "AI-powered insights: lesson plans, risk prediction, report cards",
        "Real-time observability: Prometheus + Grafana + Tempo tracing",
        "Mobile-first parent/student experience via React Native",
        "White-label branding per tenant (custom domain + logo)",
        "India-first: UPI payments, DPDP-compliant data handling, Hindi support",
    ])
    doc.h2("Module Map")
    doc.table(
        ["Module", "Key Features"],
        [
            ["Authentication", "JWT · Refresh tokens · RBAC · Multi-device sessions"],
            ["Academic",       "Classes · Sections · Timetable · Lesson Plans · Exams"],
            ["Attendance",     "QR-code · Manual · Staff attendance · Analytics"],
            ["Finance",        "Fee structures · UPI/Razorpay · Receipts · Defaulters"],
            ["Communication",  "Email · SMS · WhatsApp · Push · Notice board"],
            ["AI Gateway",     "Claude + GPT · Prompt registry · Usage analytics"],
            ["Monitoring",     "Prometheus · Grafana · Tempo · JVM · DB metrics"],
            ["Mobile",         "React Native · Offline sync · Biometric auth"],
        ],
        col_widths=[50, 120],
    )


def s02_architecture_overview(doc: Doc):
    doc.add_page()
    doc.h1("Architecture Overview")
    doc.body(
        "CloudCampus follows a layered, modular monolith architecture running on Docker Compose "
        "for local development and Kubernetes-ready containers for production. Each bounded context "
        "is a Java package with its own controller ? service ? repository stack."
    )
    doc.h2("Technology Stack")
    doc.table(
        ["Layer", "Technology", "Version"],
        [
            ["Backend API",      "Spring Boot",           "3.4.5"],
            ["Language",         "Java",                  "21 LTS"],
            ["ORM",              "Hibernate / Spring JPA", "6.6"],
            ["Database",         "PostgreSQL",            "16"],
            ["Cache",            "Redis",                 "7.2"],
            ["Message Broker",   "RabbitMQ",              "3.13"],
            ["Object Storage",   "MinIO",                 "RELEASE.2024"],
            ["Migrations",       "Flyway",                "10.20"],
            ["Frontend",         "React + TypeScript",    "18 / Vite 5"],
            ["Mobile",           "React Native",          "0.74"],
            ["Observability",    "Prometheus + Grafana",  "2.x / 10.x"],
            ["Tracing",          "Grafana Tempo",         "2.x"],
            ["AI",               "Spring AI",             "1.0.0"],
        ],
        col_widths=[50, 70, 50],
    )
    doc.h2("Request Flow")
    doc.code(
        "Browser/Mobile ? Nginx (TLS termination)\n"
        "  ? Spring Boot API (Port 8080)\n"
        "    ? JWT Filter ? Tenant Filter ? Rate Limiter\n"
        "    ? Controller ? Service ? Repository (JPA)\n"
        "    ? PostgreSQL (primary data)\n"
        "    ? Redis (session cache, rate-limit counters)\n"
        "    ? RabbitMQ (async notifications)\n"
        "    ? MinIO (file uploads)\n"
        "  ? Prometheus scrape /actuator/prometheus\n"
        "  ? Grafana dashboard / Tempo trace",
        label="Request lifecycle:"
    )


def s03_multitenant(doc: Doc):
    doc.add_page()
    doc.h1("Multi-Tenant Architecture")
    doc.body(
        "CloudCampus uses shared-schema multi-tenancy. Every tenant-scoped table carries a "
        "tenant_id UUID column. Hibernate @Filter ensures every JPA query automatically appends "
        "WHERE tenant_id = :currentTenant. Cross-tenant data leakage is impossible at the ORM layer."
    )
    doc.h2("Isolation Layers")
    doc.bullet([
        "JWT claim tenant_id -- extracted on every request, stored in RequestContext",
        "Hibernate @TenantFilter -- applied globally to all @Entity classes",
        "Repository-layer checks -- service methods validate tenantId matches JWT",
        "RLS-ready schema -- PostgreSQL Row Level Security can be enabled per table",
        "Feature flags per tenant -- granular capability control",
        "Subscription tiers -- BASIC / STANDARD / ENTERPRISE feature gating",
    ])
    doc.h2("Tenant Provisioning Flow")
    doc.code(
        "1. SuperAdmin calls POST /v1/super-admin/tenants\n"
        "2. TenantServiceImpl creates: tenants row + schools row + MAIN school\n"
        "3. Flyway baseline schema already present (shared)\n"
        "4. Default features seeded from features table\n"
        "5. Subscription record created (BASIC by default)\n"
        "6. SuperAdmin enables features / upgrades plan as needed\n"
        "7. SchoolAdmin invited ? JWT includes tenant_id + school_id",
        label="Tenant onboarding sequence:"
    )
    doc.h2("Demo Tenant")
    doc.table(
        ["Field", "Value"],
        [
            ["Tenant ID",   "c0000000-0000-0000-0000-000000000001"],
            ["Slug",        "greenwood-demo"],
            ["School",      "Greenwood International School"],
            ["Plan",        "Enterprise (all features enabled)"],
            ["Mode",        "Read-only demo -- writes blocked via DemoModeInterceptor"],
            ["Admin login", "gw.admin / Demo@1234"],
        ],
        col_widths=[45, 125],
    )


def s04_school_setup(doc: Doc):
    doc.add_page()
    doc.h1("School Setup Flow")
    doc.body(
        "A new school on CloudCampus goes through a structured onboarding flow that provisions "
        "all required data automatically. The system is designed for zero-touch provisioning."
    )
    doc.h2("Onboarding Checklist")
    doc.table(
        ["Step", "Action", "Automated?"],
        [
            ["1", "Create Tenant record",           "Yes -- API"],
            ["2", "Provision MAIN school",           "Yes -- TenantServiceImpl"],
            ["3", "Seed feature flags",              "Yes -- from features table"],
            ["4", "Create academic year",            "Manual -- SchoolAdmin"],
            ["5", "Define classes & sections",       "Manual -- SchoolAdmin"],
            ["6", "Import teacher roster",           "Manual -- CSV upload"],
            ["7", "Import student roster",           "Manual -- CSV upload"],
            ["8", "Configure fee structures",        "Manual -- Finance module"],
            ["9", "Set timetable",                   "Manual -- Timetable module"],
            ["10","Enable communication channels",   "Config -- API keys"],
        ],
        col_widths=[10, 100, 60],
    )


def s05_demo_tenant_strategy(doc: Doc):
    doc.add_page()
    doc.h1("Demo Tenant Strategy")
    doc.body(
        "Greenwood International School is the platform's permanent enterprise showcase tenant. "
        "It is seeded automatically on startup when app.demo.enabled=true and reset nightly "
        "at 02:00 AM server time."
    )
    doc.h2("Data Summary")
    doc.table(
        ["Module", "Demo Data"],
        [
            ["Academic Year",   "2025-26 (current)"],
            ["Classes",         "15 (Nursery, LKG, UKG, Class 1-12)"],
            ["Sections",        "45 (3 per class: A, B, C)"],
            ["Subjects",        "10 (Math, Science, English, Hindi, SST, CS, Phy, Chem, Bio, PE)"],
            ["Students",        "1,130 (25 per section) + 5 named demo students"],
            ["Teachers",        "40 + 1 school admin"],
            ["Attendance",      "20 working days, 90% present rate"],
            ["Exams",           "2 (Unit Test 1, Mid-Term) with marks & results"],
            ["Lesson Plans",    "10 (PUBLISHED)"],
            ["Homework",        "3 assignments"],
            ["Assignments",     "5 (with student submissions)"],
            ["Notices",         "5 school notices (published)"],
            ["Timetable",       "3 sections × 6 days × 8 periods = 144 slots"],
            ["Staff Attendance","15 staff × 20 days"],
            ["Leave Requests",  "10 (APPROVED / REJECTED / PENDING)"],
            ["Fee Records",     "Tuition + Exam fee per demo student"],
            ["Notifications",   "15 email/SMS logs"],
            ["WhatsApp Logs",   "10 WhatsApp message logs"],
            ["AI Usage Logs",   "15 AI call records (Claude + GPT)"],
        ],
        col_widths=[55, 115],
    )
    doc.h2("Demo Credentials")
    doc.table(
        ["Role", "Username", "Password", "Portal"],
        [
            ["School Admin",  "gw.admin",      "Demo@1234", "/school-admin/dashboard"],
            ["Teacher 1",     "gw.teacher001", "Demo@1234", "/teacher/dashboard"],
            ["Teacher 2",     "gw.teacher002", "Demo@1234", "/teacher/dashboard"],
            ["Student",       "gw.student001", "Demo@1234", "/student/dashboard"],
            ["Parent",        "gw.parent001",  "Demo@1234", "/parent/dashboard"],
        ],
        col_widths=[35, 40, 30, 65],
    )


def s06_seeder_architecture(doc: Doc):
    doc.add_page()
    doc.h1("Seeder Architecture")
    doc.body(
        "The demo seeder is an ApplicationRunner that executes once at startup. "
        "It is conditionally activated via @ConditionalOnProperty and guarded against re-seeding."
    )
    doc.h2("Key Classes")
    doc.table(
        ["Class", "Purpose"],
        [
            ["DemoDataSeeder",      "ApplicationRunner @Order(20) -- seeds all demo data"],
            ["DemoConstants",       "Stable UUID constants + shared configuration"],
            ["IndianNameGenerator", "Deterministic Indian names, phones, addresses (seed=42M)"],
            ["DemoModeInterceptor", "HandlerInterceptor -- blocks writes for demo JWT"],
            ["DemoResetScheduler",  "@Scheduled(0 0 2 * * *) -- nightly data reset"],
        ],
        col_widths=[55, 115],
    )
    doc.h2("Idempotent Guard")
    doc.code(
        "SELECT COUNT(*) FROM students WHERE tenant_id = DEMO_TENANT_ID\n"
        "-- If count >= 100 ? skip seeding (already done)\n"
        "-- If count < 100  ? run full seed (first boot or after manual wipe)",
        label="Startup guard logic:"
    )
    doc.h2("Seeder Execution Order")
    doc.code(
        "@Order(10) -- SuperAdminBootstrap   (superadmin user)\n"
        "@Order(20) -- DemoDataSeeder        (all Greenwood demo data)\n\n"
        "Seed sequence within DemoDataSeeder:\n"
        "  1.  Academic year\n"
        "  2.  Departments + fee categories\n"
        "  3.  Subjects (10)\n"
        "  4.  Classes (15) + Sections (45)\n"
        "  5.  Admin user + staff record\n"
        "  6.  40 teacher users + staff records\n"
        "  7.  5 named demo student + parent users\n"
        "  8.  1,130 bulk students\n"
        "  9.  Fee structures\n"
        "  10. Attendance (6 sections × 20 days)\n"
        "  11. Exams + marks + results\n"
        "  12. Lesson plans (10)\n"
        "  13. Homework (3)\n"
        "  14. Notices (5)\n"
        "  15. Timetable (144 slots)\n"
        "  16. Staff attendance (15 staff × 20 days)\n"
        "  17. Leave requests (10)\n"
        "  18. Student fee records + payments\n"
        "  19. Assignments (5 + submissions)\n"
        "  20. Notification logs (15)\n"
        "  21. WhatsApp logs (10)\n"
        "  22. AI usage logs (15)",
    )


def s07_docker_setup(doc: Doc):
    doc.add_page()
    doc.h1("Docker Setup")
    doc.body(
        "CloudCampus infrastructure runs entirely in Docker Compose. The backend and frontend "
        "run locally during development but are containerised for staging and production."
    )
    doc.h2("Container Inventory")
    doc.table(
        ["Service", "Image", "Port", "Purpose"],
        [
            ["postgres",    "postgres:16-alpine",         "5432",      "Primary database"],
            ["redis",       "redis:7.2-alpine",           "6379",      "Cache + rate limiting"],
            ["rabbitmq",    "rabbitmq:3.13-management",   "5672/15672","Message broker + mgmt UI"],
            ["minio",       "minio/minio",                "9000/9001", "Object storage + console"],
            ["mailhog",     "mailhog/mailhog",            "1025/8025", "Dev SMTP + web UI"],
            ["grafana",     "grafana/grafana",            "3100",      "Metrics dashboards"],
            ["prometheus",  "prom/prometheus",            "9090",      "Metrics scraping"],
            ["tempo",       "grafana/tempo",              "3200",      "Distributed tracing"],
        ],
        col_widths=[28, 55, 30, 57],
    )
    doc.h2("Start / Stop Commands")
    doc.code(
        "# Start all infrastructure\n"
        "docker compose up -d postgres redis rabbitmq minio mailhog grafana prometheus tempo\n\n"
        "# Start backend (from /backend directory)\n"
        "mvn spring-boot:run -Dspring-boot.run.profiles=dev\n\n"
        "# Start frontend (from /frontend directory)\n"
        "npm run dev\n\n"
        "# Stop everything\n"
        "docker compose down\n\n"
        "# Full reset (including volumes)\n"
        "docker compose down -v",
    )


def s08_postgres_setup(doc: Doc):
    doc.add_page()
    doc.h1("PostgreSQL Setup")
    doc.h2("Connection Details (Dev)")
    doc.table(
        ["Parameter", "Value"],
        [
            ["Host",       "localhost"],
            ["Port",       "5432"],
            ["Database",   "cloudcampus"],
            ["Username",   "cloudcampus"],
            ["Password",   "cloudcampus"],
            ["JDBC URL",   "jdbc:postgresql://localhost:5432/cloudcampus"],
        ],
        col_widths=[45, 125],
    )
    doc.h2("Schema Management -- Flyway")
    doc.body(
        "All schema changes are managed exclusively through Flyway versioned migrations "
        "in backend/src/main/resources/db/migration/. Never modify the schema manually."
    )
    doc.code(
        "# Current migration count\n"
        "SELECT version, description, installed_on\n"
        "FROM flyway_schema_history\n"
        "ORDER BY installed_rank DESC LIMIT 10;\n\n"
        "# Check pending migrations\n"
        "mvn flyway:info -pl backend\n\n"
        "# Repair checksum mismatches\n"
        "mvn flyway:repair -pl backend",
    )
    doc.h2("Key Tables")
    doc.bullet([
        "tenants -- top-level tenant registry",
        "schools -- one or more schools per tenant",
        "users -- all user accounts (JWT auth)",
        "students -- student lifecycle records",
        "staff -- teacher and admin staff",
        "academic_years / classes / sections / subjects",
        "attendance_sessions + attendance_records",
        "fee_structures + student_fee_records + fee_payments",
        "exams + exam_subjects + student_marks + exam_results",
        "ai_usage_logs -- AI token usage and cost tracking",
    ])


def s09_redis_setup(doc: Doc):
    doc.add_page()
    doc.h1("Redis Setup")
    doc.body("Redis serves two functions: session/JWT caching and distributed rate-limit counters.")
    doc.h2("Configuration")
    doc.code(
        "# application-dev.yml\n"
        "spring:\n"
        "  data:\n"
        "    redis:\n"
        "      host: localhost\n"
        "      port: 6379\n"
        "      password:              # empty in dev\n"
        "      timeout: 2000ms\n"
        "      lettuce:\n"
        "        pool:\n"
        "          max-active: 10\n"
        "          max-idle: 5",
    )
    doc.h2("Key Patterns")
    doc.table(
        ["Key Pattern", "Purpose", "TTL"],
        [
            ["rate:login:{ip}",       "Login brute-force counter",    "15 min"],
            ["rate:api:{userId}",     "Per-user API rate limit",      "1 min"],
            ["session:{jti}",         "Invalidated JWT JTI blacklist", "Token expiry"],
            ["refresh:{token}",       "Refresh token validity",       "7 days"],
            ["tenant:features:{tid}", "Feature flag cache",           "30 min"],
        ],
        col_widths=[60, 70, 40],
    )
    doc.h2("Monitoring")
    doc.code(
        "# Connect to Redis CLI\n"
        "docker exec -it cloudcampus-redis-1 redis-cli\n\n"
        "# Memory usage\n"
        "INFO memory\n\n"
        "# Key count\n"
        "DBSIZE\n\n"
        "# Slow log\n"
        "SLOWLOG GET 10\n\n"
        "# Monitor live commands\n"
        "MONITOR",
    )


def s10_rabbitmq_setup(doc: Doc):
    doc.add_page()
    doc.h1("RabbitMQ Setup")
    doc.body("RabbitMQ handles all async notifications: email, SMS, WhatsApp, and push.")
    doc.h2("Connection Details")
    doc.table(
        ["Parameter", "Value"],
        [
            ["Host",         "localhost"],
            ["AMQP Port",    "5672"],
            ["Management UI","http://localhost:15672"],
            ["Username",     "guest"],
            ["Password",     "guest"],
        ],
        col_widths=[45, 125],
    )
    doc.h2("Queues")
    doc.table(
        ["Queue", "Purpose", "DLQ"],
        [
            ["notification.email",    "Outbound email dispatch",       "notification.email.dlq"],
            ["notification.sms",      "Outbound SMS dispatch",         "notification.sms.dlq"],
            ["notification.whatsapp", "WhatsApp Business API messages","notification.wa.dlq"],
            ["notification.push",     "FCM push notifications",        "notification.push.dlq"],
            ["audit.events",          "Async audit log writes",        "--"],
        ],
        col_widths=[50, 75, 45],
    )
    doc.code(
        "# List queues with message counts\n"
        "docker exec cloudcampus-rabbitmq-1 \\\n"
        "  rabbitmqctl list_queues name messages consumers\n\n"
        "# Purge a stuck queue (dev only)\n"
        "docker exec cloudcampus-rabbitmq-1 \\\n"
        "  rabbitmqctl purge_queue notification.email",
    )


def s11_minio_setup(doc: Doc):
    doc.add_page()
    doc.h1("MinIO Setup")
    doc.body("MinIO provides S3-compatible object storage for student documents, "
             "profile photos, assignment files, and generated PDF reports.")
    doc.h2("Connection")
    doc.table(
        ["Parameter", "Value"],
        [
            ["Endpoint",  "http://localhost:9000"],
            ["Console",   "http://localhost:9001"],
            ["Access Key","minioadmin"],
            ["Secret Key","minioadmin"],
        ],
        col_widths=[45, 125],
    )
    doc.h2("Buckets")
    doc.table(
        ["Bucket", "Contents", "Access"],
        [
            ["cloudcampus-docs",    "Student documents, ID cards",   "Private"],
            ["cloudcampus-media",   "Profile photos, school logos",  "Public read"],
            ["cloudcampus-reports", "Generated PDF reports",         "Private"],
            ["cloudcampus-backup",  "Database dump archives",        "Private"],
        ],
        col_widths=[50, 80, 40],
    )
    doc.code(
        "# MinIO health check\n"
        "curl http://localhost:9000/minio/health/live\n\n"
        "# List buckets via mc (MinIO client)\n"
        "mc alias set local http://localhost:9000 minioadmin minioadmin\n"
        "mc ls local/",
    )


def s12_frontend_setup(doc: Doc):
    doc.add_page()
    doc.h1("Frontend Setup")
    doc.h2("Tech Stack")
    doc.table(
        ["Technology", "Version", "Purpose"],
        [
            ["React",         "18",  "UI framework"],
            ["TypeScript",    "5.x", "Type safety"],
            ["Vite",          "5.x", "Build tool / dev server"],
            ["React Query",   "5.x", "Server state + caching"],
            ["Zustand",       "4.x", "Client state management"],
            ["React Router",  "6.x", "SPA routing"],
            ["Tailwind CSS",  "3.x", "Utility-first styling"],
        ],
        col_widths=[50, 30, 90],
    )
    doc.h2("Dev Setup")
    doc.code(
        "cd frontend\n"
        "npm install\n"
        "npm run dev        # http://localhost:5173\n\n"
        "# Production build\n"
        "npm run build\n"
        "npm run preview",
    )
    doc.h2("Feature Structure")
    doc.code(
        "frontend/src/\n"
        "  features/\n"
        "    auth/              -- login, token refresh\n"
        "    school-admin/      -- dashboard, students, fees, notices\n"
        "    teacher/           -- lesson plans, attendance, exams\n"
        "    student/           -- results, timetable, homework\n"
        "    parent/            -- fees, attendance alerts\n"
        "    super-admin/       -- tenant management\n"
        "  common/              -- shared components, hooks, utils\n"
        "  stores/              -- Zustand auth + tenant store",
    )


def s13_mobile_setup(doc: Doc):
    doc.add_page()
    doc.h1("Mobile Setup")
    doc.body("CloudCampus Mobile is a React Native app covering parent and student portals "
             "with offline sync and biometric authentication.")
    doc.h2("Key Features")
    doc.bullet([
        "Parent portal: attendance alerts, fee payments, report cards",
        "Student portal: timetable, homework, exam results",
        "QR code attendance -- teacher scans student QR",
        "Offline sync -- reads cached on device when network unavailable",
        "Push notifications via Firebase FCM",
        "Biometric login (Face ID / Fingerprint)",
    ])
    doc.h2("Development")
    doc.code(
        "cd mobile\n"
        "npm install\n\n"
        "# iOS\n"
        "cd ios && pod install && cd ..\n"
        "npx react-native run-ios\n\n"
        "# Android\n"
        "npx react-native run-android",
    )


def s14_ai_module(doc: Doc):
    doc.add_page()
    doc.h1("AI Module Setup")
    doc.body("CloudCampus AI Gateway (CC-1600) provides managed access to Claude and GPT models "
             "with token tracking, cost attribution per tenant, and a prompt template registry.")
    doc.h2("Supported Models")
    doc.table(
        ["Provider", "Model", "Use Case"],
        [
            ["Anthropic", "claude-sonnet-4-6", "Lesson plans, report cards, risk analysis"],
            ["Anthropic", "claude-haiku-4-5",  "Quick summaries, homework feedback"],
            ["OpenAI",    "gpt-4o-mini",        "Attendance insights, fee alerts"],
        ],
        col_widths=[40, 55, 75],
    )
    doc.h2("Prompt Registry")
    doc.body("Prompt templates are stored in ai_prompt_templates with versioning. "
             "Only one version per prompt_key can be is_active=true (enforced by partial unique index).")
    doc.h2("AI Features")
    doc.bullet([
        "lesson_plan_generator -- AI-generated weekly lesson plans from topic + grade",
        "student_risk_analyzer -- predicts dropout/performance risk from attendance + marks",
        "report_card_generator -- narrative report card comments from marks data",
        "attendance_insight    -- patterns and anomaly detection in attendance data",
        "teacher_productivity  -- workload and lesson coverage analysis",
        "homework_feedback     -- auto-feedback on student text submissions",
        "classroom_summary     -- daily classroom activity digest",
    ])
    doc.h2("Configuration")
    doc.code(
        "# application-dev.yml\n"
        "spring:\n"
        "  ai:\n"
        "    anthropic:\n"
        "      api-key: ${ANTHROPIC_API_KEY}\n"
        "      chat.options.model: claude-sonnet-4-6\n"
        "    openai:\n"
        "      api-key: ${OPENAI_API_KEY}\n"
        "      chat.options.model: gpt-4o-mini",
    )


def s15_feature_flags(doc: Doc):
    doc.add_page()
    doc.h1("Feature Flag System")
    doc.body("Every CloudCampus capability is gated by a feature flag stored in tenant_features. "
             "This enables per-tenant plan enforcement and gradual rollout.")
    doc.h2("Architecture")
    doc.code(
        "features table          -- global catalogue of feature keys\n"
        "tenant_features table   -- (tenant_id, feature_key, enabled)\n"
        "TenantFeatureService    -- checks cache ? DB ? denies if disabled\n"
        "Redis cache             -- 30-min TTL per tenant feature set",
    )
    doc.h2("Key Feature Keys")
    doc.table(
        ["Feature Key", "Description", "Plan"],
        [
            ["attendance",       "Student attendance module",   "BASIC+"],
            ["fee_management",   "Fee collection + receipts",   "BASIC+"],
            ["timetable",        "Timetable management",        "STANDARD+"],
            ["ai_lesson_plans",  "AI lesson plan generation",   "ENTERPRISE"],
            ["ai_risk_analysis", "AI student risk prediction",  "ENTERPRISE"],
            ["custom_domain",    "Custom DNS domain",           "ENTERPRISE"],
            ["whatsapp",         "WhatsApp Business API",       "STANDARD+"],
            ["hostel",           "Hostel management",           "STANDARD+"],
            ["transport",        "Transport module",            "STANDARD+"],
            ["website_builder",  "School website builder",      "ENTERPRISE"],
        ],
        col_widths=[50, 80, 40],
    )


def s16_subscription(doc: Doc):
    doc.add_page()
    doc.h1("Subscription System")
    doc.table(
        ["Plan", "Student Limit", "Features"],
        [
            ["BASIC",      "Up to 300",   "Core modules: attendance, fees, notices"],
            ["STANDARD",   "Up to 1,000", "BASIC + timetable, WhatsApp, hostel, transport"],
            ["ENTERPRISE", "Unlimited",   "All features + AI + custom domain + API access"],
        ],
        col_widths=[35, 35, 100],
    )
    doc.h2("Enforcement")
    doc.body("SubscriptionService checks the current plan tier before allowing module access. "
             "Upgrade/downgrade is handled by SuperAdmin via /v1/super-admin/tenants/{id}/subscription.")


def s17_branding(doc: Doc):
    doc.add_page()
    doc.h1("Branding System")
    doc.body("Enterprise tenants can white-label CloudCampus with custom domains, logos, "
             "primary colors, and school-specific email sender names.")
    doc.h2("Capabilities")
    doc.bullet([
        "Custom domain -- e.g., erp.greenwood-intl.edu.in (DNS TXT verification)",
        "School logo uploaded to MinIO cloudcampus-media bucket",
        "Primary brand color -- injected into frontend via CSS variables",
        "Email sender name -- 'Greenwood ERP' instead of 'CloudCampus'",
        "White-label mobile app -- custom app name and icon via build config",
    ])


def s18_auth_flow(doc: Doc):
    doc.add_page()
    doc.h1("Authentication Flow")
    doc.code(
        "POST /v1/auth/login\n"
        "  { username, password }\n"
        "  ? AuthController ? AuthServiceImpl\n"
        "  ? UserRepository.findByUsername()\n"
        "  ? BCryptPasswordEncoder.matches()\n"
        "  ? AuditLogService.record(LOGIN)\n"
        "  ? JwtUtil.generateAccessToken()    TTL: 15 min\n"
        "  ? JwtUtil.generateRefreshToken()   TTL: 7 days\n"
        "  ? { accessToken, refreshToken, role, tenantId, schoolId }\n\n"
        "POST /v1/auth/refresh\n"
        "  { refreshToken }\n"
        "  ? Validate refresh token signature + expiry\n"
        "  ? Rotate refresh token (old invalidated in Redis)\n"
        "  ? { accessToken, refreshToken }",
        label="Login + token refresh flow:"
    )
    doc.h2("JWT Claims")
    doc.code(
        '{\n'
        '  "sub":       "<userId>",\n'
        '  "jti":       "<unique token ID>",\n'
        '  "tenant_id": "<tenantId>",\n'
        '  "school_id": "<schoolId>",\n'
        '  "role":      "SCHOOL_ADMIN | TEACHER | STUDENT | PARENT",\n'
        '  "iat":       <issued-at epoch>,\n'
        '  "exp":       <expiry epoch>\n'
        '}',
        label="Access token payload:"
    )


def s19_jwt_security(doc: Doc):
    doc.add_page()
    doc.h1("JWT Security")
    doc.bullet([
        "Algorithm: HMAC-SHA256 (HS256) -- secret from environment variable JWT_SECRET",
        "Access token TTL: 15 minutes -- short to limit blast radius on leakage",
        "Refresh token TTL: 7 days -- stored hash in Redis for revocation",
        "JTI blacklist: revoked JTIs stored in Redis until original expiry",
        "DemoModeInterceptor: reads tenant_id from JWT to block demo writes",
        "No JWT bypass: security filter runs before every non-public endpoint",
    ])
    doc.callout("CRITICAL: Never set JWT_SECRET to a static value in code. "
                "Always use an environment variable or Vault secret.", RED)
    doc.h2("Token Revocation")
    doc.code(
        "# Invalidate all sessions for a user (e.g., password change)\n"
        "POST /v1/auth/logout\n"
        "  ? Adds JTI to Redis blacklist with TTL = remaining token lifetime\n"
        "  ? Deletes all refresh tokens for user\n\n"
        "# Force-logout all sessions (admin action)\n"
        "POST /v1/super-admin/users/{userId}/invalidate-sessions",
    )


def s20_demo_reset(doc: Doc):
    doc.add_page()
    doc.h1("Demo Reset System")
    doc.body("DemoResetScheduler runs nightly at 02:00 AM. It deletes transient data, "
             "preserves structural data, and re-seeds all content via DemoDataSeeder.")
    doc.h2("Reset Schedule")
    doc.code(
        "@Scheduled(cron = \"0 0 2 * * *\")\n"
        "@ConditionalOnProperty(name = \"app.demo.enabled\", havingValue = \"true\")\n"
        "public class DemoResetScheduler {\n"
        "    // Deletes: marks, results, exam_subjects, exams, attendance,\n"
        "    //          lesson_plans, homework, notices, bulk students\n"
        "    // Preserves: tenant, school, classes, sections, subjects,\n"
        "    //            named demo students (GW-0001 to GW-0005)\n"
        "    // Re-seeds:  calls DemoDataSeeder.run(null)\n"
        "}",
    )
    doc.h2("Manual Force Reset")
    doc.code(
        "# Wipe students to trigger full re-seed on next restart\n"
        "DELETE FROM students\n"
        "WHERE tenant_id = 'c0000000-0000-0000-0000-000000000001'\n"
        "  AND student_number NOT IN ('GW-0001','GW-0002','GW-0003','GW-0004','GW-0005');\n\n"
        "# Then restart backend:\n"
        "pkill -f CloudCampusApplication && mvn spring-boot:run -pl backend",
    )


def s21_cicd(doc: Doc):
    doc.add_page()
    doc.h1("CI/CD Pipeline")
    doc.h2("Recommended Pipeline Stages")
    doc.table(
        ["Stage", "Tool", "Action"],
        [
            ["Build",        "Maven",      "mvn clean package -DskipTests"],
            ["Unit Tests",   "JUnit 5",    "mvn test"],
            ["Integration",  "Testcontainers", "Docker Postgres + Redis in CI"],
            ["Code Quality", "SonarQube",  "sonar:sonar analysis"],
            ["Docker Build", "Docker",     "docker build -t cloudcampus:$VERSION ."],
            ["Push Image",   "ECR/GCR",    "docker push registry/cloudcampus:$VERSION"],
            ["Deploy",       "Helm/k8s",   "helm upgrade cloudcampus ./charts/"],
            ["Smoke Test",   "curl",       "GET /actuator/health ? UP"],
        ],
        col_widths=[32, 38, 100],
    )
    doc.h2("Environment Promotion")
    doc.code(
        "dev  ? staging ? production\n\n"
        "dev:        auto-deploy on merge to main\n"
        "staging:    auto-deploy on Git tag (v*.*.*-rc)\n"
        "production: manual approval gate ? deploy on Git tag (v*.*.*)",
    )


def s22_env_vars(doc: Doc):
    doc.add_page()
    doc.h1("Environment Variables")
    doc.table(
        ["Variable", "Required", "Description"],
        [
            ["DB_URL",               "Yes", "JDBC URL for PostgreSQL"],
            ["DB_USERNAME",          "Yes", "PostgreSQL username"],
            ["DB_PASSWORD",          "Yes", "PostgreSQL password"],
            ["REDIS_HOST",           "Yes", "Redis hostname"],
            ["REDIS_PASSWORD",       "Prod","Redis AUTH password"],
            ["RABBITMQ_HOST",        "Yes", "RabbitMQ hostname"],
            ["RABBITMQ_USERNAME",    "Yes", "RabbitMQ username"],
            ["RABBITMQ_PASSWORD",    "Yes", "RabbitMQ password"],
            ["JWT_SECRET",           "Yes", "HS256 signing secret (min 32 chars)"],
            ["MINIO_ENDPOINT",       "Yes", "MinIO endpoint URL"],
            ["MINIO_ACCESS_KEY",     "Yes", "MinIO access key"],
            ["MINIO_SECRET_KEY",     "Yes", "MinIO secret key"],
            ["ANTHROPIC_API_KEY",    "AI",  "Anthropic Claude API key"],
            ["OPENAI_API_KEY",       "AI",  "OpenAI GPT API key"],
            ["RAZORPAY_KEY_ID",      "Pay", "Razorpay key ID"],
            ["RAZORPAY_KEY_SECRET",  "Pay", "Razorpay key secret"],
            ["app.demo.enabled",     "Dev", "true = enable Greenwood demo seeder"],
        ],
        col_widths=[55, 20, 95],
    )


def s23_production_deploy(doc: Doc):
    doc.add_page()
    doc.h1("Production Deployment")
    doc.h2("Docker Production Compose")
    doc.code(
        "# Production uses separate docker-compose.prod.yml\n"
        "# Key differences from dev:\n"
        "#  - No mailhog (real SMTP)\n"
        "#  - Postgres with replication\n"
        "#  - Redis with AUTH password\n"
        "#  - RabbitMQ with TLS\n"
        "#  - MinIO behind Nginx reverse proxy\n"
        "#  - All secrets from Docker secrets / Vault\n\n"
        "docker compose -f docker-compose.prod.yml up -d",
    )
    doc.h2("Kubernetes (Production)")
    doc.code(
        "# Namespace\n"
        "kubectl create namespace cloudcampus\n\n"
        "# Deploy via Helm\n"
        "helm install cloudcampus ./charts/cloudcampus \\\n"
        "  --namespace cloudcampus \\\n"
        "  --set image.tag=1.0.0 \\\n"
        "  --set postgres.external=true \\\n"
        "  --set secrets.jwtSecret=$JWT_SECRET\n\n"
        "# Check rollout\n"
        "kubectl rollout status deployment/cloudcampus -n cloudcampus",
    )


def s24_monitoring(doc: Doc):
    doc.add_page()
    doc.h1("Monitoring & Observability")
    doc.body("CloudCampus exposes a rich set of metrics via Micrometer, scraped by Prometheus, "
             "visualised in Grafana, and traced via Tempo (OpenTelemetry).")
    doc.h2("Observability Stack")
    doc.table(
        ["Component", "URL (Dev)", "Purpose"],
        [
            ["Prometheus",   "http://localhost:9090",  "Metrics storage & alerting"],
            ["Grafana",      "http://localhost:3100",  "Dashboards & visualization"],
            ["Tempo",        "http://localhost:3200",  "Distributed trace storage"],
            ["Actuator",     "http://localhost:8080/actuator", "Health + metrics endpoint"],
            ["RabbitMQ UI",  "http://localhost:15672", "Queue monitoring"],
            ["MinIO Console","http://localhost:9001",  "Storage monitoring"],
        ],
        col_widths=[40, 65, 65],
    )
    doc.h2("Key Metrics")
    doc.bullet([
        "http_server_requests_seconds -- API response time histogram",
        "hikaricp_connections_active  -- DB connection pool usage",
        "jvm_memory_used_bytes        -- JVM heap and non-heap",
        "jvm_gc_pause_seconds         -- Garbage collector pauses",
        "process_cpu_usage            -- JVM CPU consumption",
        "cloudcampus_tenant_requests  -- Per-tenant request counters (custom)",
        "rabbitmq_queue_messages      -- Queue depth per queue",
        "redis_connected_clients      -- Active Redis connections",
    ])


def s25_backup_restore(doc: Doc):
    doc.add_page()
    doc.h1("Backup & Restore")
    doc.h2("PostgreSQL Backup (pgbackup)")
    doc.code(
        "# The pgbackup sidecar runs pg_dump daily at 03:00 AM\n"
        "# Dumps are stored in MinIO: cloudcampus-backup/postgres/YYYY-MM-DD/\n\n"
        "# Manual backup\n"
        "docker exec cloudcampus-postgres-1 \\\n"
        "  pg_dump -U cloudcampus cloudcampus | gzip > backup_$(date +%Y%m%d).sql.gz\n\n"
        "# Restore\n"
        "gunzip -c backup_20260101.sql.gz | \\\n"
        "  docker exec -i cloudcampus-postgres-1 \\\n"
        "  psql -U cloudcampus cloudcampus",
    )
    doc.h2("Redis Backup")
    doc.code(
        "# Redis RDB snapshot\n"
        "docker exec cloudcampus-redis-1 redis-cli BGSAVE\n\n"
        "# Copy dump.rdb\n"
        "docker cp cloudcampus-redis-1:/data/dump.rdb ./redis_backup_$(date +%Y%m%d).rdb",
    )


def s26_scaling(doc: Doc):
    doc.add_page()
    doc.h1("Scaling Strategy")
    doc.h2("Vertical Scaling (Current)")
    doc.body("Single-node Docker Compose deployment handles up to ~50 concurrent tenants "
             "and ~5,000 daily active users comfortably on a 4-core / 8 GB VM.")
    doc.h2("Horizontal Scaling (>50 tenants)")
    doc.table(
        ["Component", "Scale Strategy"],
        [
            ["Backend API",   "Stateless -- run N replicas behind load balancer"],
            ["PostgreSQL",    "Read replica for reporting queries"],
            ["Redis",         "Redis Cluster with 3 shards"],
            ["RabbitMQ",      "Clustered 3-node quorum queues"],
            ["MinIO",         "Distributed mode across 4 nodes"],
            ["Grafana",       "Single instance (monitoring only)"],
        ],
        col_widths=[45, 125],
    )
    doc.callout("IMPORTANT: The backend is already stateless (no in-memory session state). "
                "Horizontal scaling requires only a shared DB, Redis, and RabbitMQ cluster.")


def s27_demo_flow(doc: Doc):
    doc.add_page()
    doc.h1("Customer Demo Flow")
    doc.body("A typical 30-minute sales demo covering all key modules.")
    doc.table(
        ["Time", "Module", "What to Show"],
        [
            ["0:00-3:00",  "Login + Dashboard",  "gw.admin login, real-time stats cards"],
            ["3:00-7:00",  "Students",           "1,130 students, search/filter, profile view"],
            ["7:00-11:00", "Attendance",         "Attendance history, 90% rate, analytics chart"],
            ["11:00-15:00","Finance",            "Fee records, PAID/PARTIAL/PENDING, receipts"],
            ["15:00-18:00","Exams & Results",    "Unit Test 1 marks, grade distribution"],
            ["18:00-21:00","AI Features",        "Lesson plan generation, risk analyzer"],
            ["21:00-24:00","Timetable",          "Class 1-A weekly schedule"],
            ["24:00-27:00","Communication",      "Notification logs, WhatsApp messages"],
            ["27:00-30:00","Monitoring",         "Grafana dashboard, container health"],
        ],
        col_widths=[22, 35, 113],
    )
    doc.callout("TIP: All write operations return HTTP 403 in demo mode -- "
                "this prevents accidental data corruption during live demos.")


def s28_readonly_protection(doc: Doc):
    doc.add_page()
    doc.h1("Read-Only Protections")
    doc.body("DemoModeInterceptor intercepts all HTTP requests before they reach the controller. "
             "It reads the tenant_id claim from the JWT and blocks POST/PUT/PATCH/DELETE for the demo tenant.")
    doc.h2("Interceptor Logic")
    doc.code(
        "if (method is GET or HEAD)  ? allow\n"
        "if (URI starts with /v1/auth/ or /v1/public/ or /actuator/) ? allow\n"
        "Extract JWT from Authorization: Bearer <token>\n"
        "Decode payload (no signature verify -- already done upstream)\n"
        "If tenant_id == DEMO_TENANT_ID:\n"
        "    return HTTP 403 { code: DEMO_READ_ONLY }\n"
        "else:\n"
        "    allow",
    )
    doc.h2("Error Response")
    doc.code(
        '{\n'
        '  "success": false,\n'
        '  "error": {\n'
        '    "code":    "DEMO_READ_ONLY",\n'
        '    "message": "This is a read-only demo environment. Write operations are disabled."\n'
        '  }\n'
        '}',
        label="HTTP 403 response body:"
    )


def s29_infra_monitoring(doc: Doc):
    doc.add_page()
    doc.h1("Infrastructure Monitoring")
    doc.body("Real-time container health monitored via docker stats and Prometheus node exporter.")
    doc.h2("Container Resource Usage (Typical Dev)")
    doc.table(
        ["Container", "RAM Usage", "CPU%", "Status"],
        [
            ["cloudcampus (backend)", "~877 MB", "2-8%",  "Healthy"],
            ["postgres",              "~60 MB",  "0.5-2%","Healthy"],
            ["redis",                 "~19 MB",  "0.1%",  "Healthy"],
            ["rabbitmq",              "~158 MB", "0.5%",  "Healthy"],
            ["grafana",               "~175 MB", "0.5%",  "Healthy"],
            ["prometheus",            "~92 MB",  "0.3%",  "Healthy"],
            ["tempo",                 "~177 MB", "0.2%",  "Healthy"],
            ["minio",                 "~152 MB", "0.2%",  "Healthy"],
            ["mailhog",               "~16 MB",  "0.0%",  "Healthy"],
        ],
        col_widths=[55, 30, 20, 65],
    )
    doc.callout("Total Infrastructure RAM: ~1.73 GB. Minimum recommended host: 8 GB RAM, 4 vCPUs.",
                TEAL)


def s30_docker_troubleshoot(doc: Doc):
    doc.add_page()
    doc.h1("Docker Troubleshooting")
    doc.h2("Essential Commands")
    doc.code(
        "# Real-time stats for all containers\n"
        "docker stats --no-stream\n\n"
        "# Check running containers\n"
        "docker compose ps\n\n"
        "# Follow logs for a container\n"
        "docker compose logs -f postgres\n\n"
        "# Inspect container details\n"
        "docker inspect cloudcampus-postgres-1\n\n"
        "# Execute shell in container\n"
        "docker exec -it cloudcampus-postgres-1 bash\n\n"
        "# Check container health\n"
        "docker inspect --format='{{.State.Health.Status}}' cloudcampus-postgres-1\n\n"
        "# View last 50 log lines\n"
        "docker compose logs --tail=50 cloudcampus",
    )
    doc.h2("Common Issues")
    doc.table(
        ["Problem", "Diagnosis", "Fix"],
        [
            ["Port already in use",   "lsof -ti:5432",          "Kill conflicting process"],
            ["Container OOM killed",  "docker inspect (OOMKilled)","Increase Docker memory limit"],
            ["Postgres won't start",  "docker logs postgres",    "Check volume permissions"],
            ["Redis timeout",         "redis-cli ping",          "Restart redis container"],
            ["Flyway migration fail", "Check flyway_schema_history","mvn flyway:repair"],
        ],
        col_widths=[45, 50, 75],
    )


def s31_health_checks(doc: Doc):
    doc.add_page()
    doc.h1("Container Health Checks")
    doc.code(
        "# Backend API\n"
        "curl http://localhost:8080/actuator/health\n"
        "# Expected: {\"status\":\"UP\"}\n\n"
        "# PostgreSQL\n"
        "docker exec cloudcampus-postgres-1 pg_isready -U cloudcampus\n"
        "# Expected: localhost:5432 - accepting connections\n\n"
        "# Redis\n"
        "docker exec cloudcampus-redis-1 redis-cli ping\n"
        "# Expected: PONG\n\n"
        "# RabbitMQ\n"
        "curl http://localhost:15672/api/aliveness-test/%%2F \\\n"
        "  -u guest:guest\n"
        "# Expected: {\"status\":\"ok\"}\n\n"
        "# MinIO\n"
        "curl http://localhost:9000/minio/health/live\n"
        "# Expected: HTTP 200\n\n"
        "# Full stack health script\n"
        "for svc in 8080 5432 6379 5672 9000; do\n"
        "  nc -zv localhost $svc 2>&1 | grep -E 'succeeded|refused'\n"
        "done",
    )


def s32_memory_analysis(doc: Doc):
    doc.add_page()
    doc.h1("Memory Usage Analysis")
    doc.h2("Understanding Container Memory")
    doc.body("All values below reflect typical usage after 30 minutes of warm operation "
             "with demo school data loaded. Values will be higher under real production load.")
    doc.table(
        ["Container", "RAM", "Normal?", "Notes"],
        [
            ["cloudcampus", "877 MB", "YES",
             "Spring Boot + JVM heap. High because JVM pre-allocates."],
            ["postgres",    "60 MB",  "YES",
             "Low -- shared_buffers defaults are conservative."],
            ["redis",       "19 MB",  "YES",
             "Very low -- only holds session cache keys."],
            ["rabbitmq",    "158 MB", "YES",
             "Erlang VM baseline. Normal for empty queues."],
            ["grafana",     "175 MB", "YES",
             "Node.js backend. Increases with more dashboards."],
            ["prometheus",  "92 MB",  "YES",
             "Grows with scrape history. ~500 MB at 2 weeks."],
            ["tempo",       "177 MB", "YES",
             "Trace storage buffer. Spikes during high traffic."],
            ["minio",       "152 MB", "YES",
             "Go binary. Stable unless many concurrent uploads."],
            ["mailhog",     "16 MB",  "YES",
             "Very lightweight -- dev SMTP only."],
        ],
        col_widths=[32, 20, 18, 100],
    )
    doc.h2("Warning Signs")
    doc.bullet([
        "Backend RAM > 2 GB ? possible heap leak, check JVM heap with jmap",
        "Postgres RAM > 500 MB ? high shared_buffers or long-running queries",
        "Redis RAM growing continuously ? TTL not set on some keys (check KEYS *)",
        "RabbitMQ RAM > 400 MB ? consumer lag, queues accumulating messages",
        "Prometheus RAM > 2 GB ? reduce scrape interval or retention period",
    ])


def s33_jvm_monitoring(doc: Doc):
    doc.add_page()
    doc.h1("JVM Monitoring")
    doc.h2("Key JVM Metrics via Actuator")
    doc.code(
        "# Heap memory\n"
        "curl http://localhost:8080/actuator/metrics/jvm.memory.used\n\n"
        "# GC pause time\n"
        "curl http://localhost:8080/actuator/metrics/jvm.gc.pause\n\n"
        "# Thread count\n"
        "curl http://localhost:8080/actuator/metrics/jvm.threads.live\n\n"
        "# CPU usage\n"
        "curl http://localhost:8080/actuator/metrics/process.cpu.usage",
    )
    doc.h2("JVM Heap Configuration")
    doc.code(
        "# Set in JAVA_TOOL_OPTIONS or application startup\n"
        "export JAVA_TOOL_OPTIONS=\"-Xms512m -Xmx1024m -XX:+UseG1GC\"\n\n"
        "# For production (4 GB host)\n"
        "JAVA_TOOL_OPTIONS=\"-Xms768m -Xmx1536m -XX:+UseG1GC \\\n"
        "  -XX:MaxGCPauseMillis=200 \\\n"
        "  -XX:+HeapDumpOnOutOfMemoryError \\\n"
        "  -XX:HeapDumpPath=/dumps/heap.hprof\"",
    )
    doc.h2("Identify Memory Leaks")
    doc.bullet([
        "Monitor jvm.memory.used over time in Grafana -- should stabilize after warm-up",
        "Continuous growth over hours = possible leak",
        "Trigger heap dump: jcmd <pid> GC.heap_dump /tmp/heap.hprof",
        "Analyze with Eclipse MAT or VisualVM",
        "Common causes: unbounded caches, ThreadLocal leaks, static collections",
    ])


def s34_postgres_monitoring(doc: Doc):
    doc.add_page()
    doc.h1("PostgreSQL Monitoring")
    doc.code(
        "-- Active connections\n"
        "SELECT count(*), state FROM pg_stat_activity GROUP BY state;\n\n"
        "-- Long-running queries (> 5 seconds)\n"
        "SELECT pid, now()-pg_stat_activity.query_start AS duration, query\n"
        "FROM pg_stat_activity\n"
        "WHERE state = 'active'\n"
        "  AND now()-query_start > interval '5 seconds'\n"
        "ORDER BY duration DESC;\n\n"
        "-- Table sizes\n"
        "SELECT relname, pg_size_pretty(pg_total_relation_size(relid))\n"
        "FROM pg_catalog.pg_statio_user_tables\n"
        "ORDER BY pg_total_relation_size(relid) DESC LIMIT 20;\n\n"
        "-- Database size\n"
        "SELECT pg_size_pretty(pg_database_size('cloudcampus'));\n\n"
        "-- Index hit ratio (should be > 99%)\n"
        "SELECT round(100*idx_blks_hit/(idx_blks_hit+idx_blks_read+0.001),2)\n"
        "  AS index_hit_ratio\n"
        "FROM pg_statio_user_tables\n"
        "WHERE idx_blks_read > 0\n"
        "LIMIT 10;",
    )
    doc.h2("HikariCP Pool Metrics")
    doc.table(
        ["Metric", "Prometheus Key", "Healthy Value"],
        [
            ["Active connections", "hikaricp_connections_active", "< pool max (10)"],
            ["Idle connections",   "hikaricp_connections_idle",   "> 0"],
            ["Pending threads",    "hikaricp_connections_pending", "0"],
            ["Connection timeout", "hikaricp_connections_timeout", "0"],
        ],
        col_widths=[50, 70, 50],
    )


def s35_redis_monitoring(doc: Doc):
    doc.add_page()
    doc.h1("Redis Monitoring")
    doc.code(
        "docker exec cloudcampus-redis-1 redis-cli INFO memory\n\n"
        "# Key metrics from INFO memory:\n"
        "#  used_memory_human      -- total allocated memory\n"
        "#  used_memory_rss_human  -- resident set size (OS view)\n"
        "#  maxmemory_human        -- configured limit (0 = unlimited)\n"
        "#  mem_fragmentation_ratio -- should be 1.0-1.5 (> 2.0 = fragmentation issue)\n\n"
        "docker exec cloudcampus-redis-1 redis-cli INFO stats\n"
        "# Key metrics:\n"
        "#  total_commands_processed\n"
        "#  instantaneous_ops_per_sec\n"
        "#  keyspace_hits / keyspace_misses  (aim for > 95% hit rate)\n"
        "#  evicted_keys  (if > 0 ? maxmemory policy kicking in)\n\n"
        "# Monitor key expiry\n"
        "docker exec cloudcampus-redis-1 redis-cli INFO keyspace",
    )


def s36_rabbitmq_monitoring(doc: Doc):
    doc.add_page()
    doc.h1("RabbitMQ Monitoring")
    doc.code(
        "# Queue depths (messages waiting)\n"
        "docker exec cloudcampus-rabbitmq-1 \\\n"
        "  rabbitmqctl list_queues name messages consumers\n\n"
        "# Expected output (healthy):\n"
        "# notification.email      0   1\n"
        "# notification.sms        0   1\n"
        "# notification.whatsapp   0   1\n"
        "# notification.push       0   1\n"
        "# audit.events            0   1\n\n"
        "# Node health\n"
        "docker exec cloudcampus-rabbitmq-1 rabbitmqctl node_health_check\n\n"
        "# Memory usage\n"
        "docker exec cloudcampus-rabbitmq-1 rabbitmqctl status | grep memory",
    )
    doc.h2("Alert Thresholds")
    doc.table(
        ["Metric", "Warning", "Critical"],
        [
            ["Queue depth",       "> 100 msgs",  "> 1,000 msgs"],
            ["Consumer count",    "0 consumers", "--"],
            ["Memory",            "> 300 MB",    "> 500 MB"],
            ["Connection count",  "> 100",       "> 500"],
        ],
        col_widths=[55, 55, 60],
    )


def s37_prometheus(doc: Doc):
    doc.add_page()
    doc.h1("Prometheus Metrics")
    doc.h2("Scrape Configuration")
    doc.code(
        "# prometheus.yml\n"
        "global:\n"
        "  scrape_interval: 15s\n"
        "  evaluation_interval: 15s\n\n"
        "scrape_configs:\n"
        "  - job_name: 'cloudcampus-backend'\n"
        "    static_configs:\n"
        "      - targets: ['host.docker.internal:8080']\n"
        "    metrics_path: /actuator/prometheus\n\n"
        "  - job_name: 'postgres'\n"
        "    static_configs:\n"
        "      - targets: ['postgres-exporter:9187']\n\n"
        "  - job_name: 'redis'\n"
        "    static_configs:\n"
        "      - targets: ['redis-exporter:9121']",
    )
    doc.h2("Useful PromQL Queries")
    doc.code(
        "# 95th percentile API response time\n"
        "histogram_quantile(0.95,\n"
        "  sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri)\n"
        ")\n\n"
        "# Error rate (5xx)\n"
        "sum(rate(http_server_requests_seconds_count{status=~\"5..\"}[5m]))\n"
        "/\n"
        "sum(rate(http_server_requests_seconds_count[5m]))\n\n"
        "# JVM heap used %\n"
        "jvm_memory_used_bytes{area=\"heap\"}\n"
        "/\n"
        "jvm_memory_max_bytes{area=\"heap\"}",
    )


def s38_grafana(doc: Doc):
    doc.add_page()
    doc.h1("Grafana Dashboards")
    doc.body("Access Grafana at http://localhost:3100  |  admin / admin")
    doc.h2("Recommended Dashboards")
    doc.table(
        ["Dashboard", "Import ID", "Shows"],
        [
            ["Spring Boot JVM",    "12900", "Heap, GC, threads, CPU"],
            ["PostgreSQL",         "9628",  "Connections, queries, table size"],
            ["Redis",              "763",   "Memory, ops/sec, hit rate"],
            ["RabbitMQ",          "10991", "Queues, messages, consumers"],
            ["MinIO",              "13502", "Bucket size, request rate"],
            ["Node Exporter",      "1860",  "Host CPU, RAM, disk, network"],
        ],
        col_widths=[45, 25, 100],
    )
    doc.h2("CloudCampus Custom Panels")
    doc.bullet([
        "Active tenants over time -- count(distinct tenant_id) from request metrics",
        "Requests per tenant -- top 10 tenants by API call volume",
        "Slow APIs heatmap -- P99 latency per endpoint",
        "Fee collection rate -- custom metric from finance module",
        "AI token spend -- from ai_usage_logs (custom Prometheus gauge)",
    ])
    doc.h2("Alerting")
    doc.code(
        "# Example Grafana alert rule (JSON API)\n"
        "# Fires when P95 latency > 500ms for 5 consecutive minutes\n"
        "alert: HighApiLatency\n"
        "expr: |\n"
        "  histogram_quantile(0.95,\n"
        "    rate(http_server_requests_seconds_bucket[5m])\n"
        "  ) > 0.5\n"
        "for: 5m\n"
        "labels:\n"
        "  severity: warning\n"
        "annotations:\n"
        "  summary: API P95 latency above 500ms",
    )


def s39_tempo_tracing(doc: Doc):
    doc.add_page()
    doc.h1("Tempo Distributed Tracing")
    doc.body("Every API request generates an OpenTelemetry trace automatically via "
             "Micrometer Tracing. Traces are stored in Grafana Tempo and linked from Grafana logs.")
    doc.h2("Configuration")
    doc.code(
        "# application.yml\n"
        "management:\n"
        "  tracing:\n"
        "    sampling:\n"
        "      probability: 1.0   # 100% in dev; use 0.1 in production\n\n"
        "spring:\n"
        "  application:\n"
        "    name: cloudcampus-backend\n\n"
        "# Tempo OTLP endpoint (via docker-compose)\n"
        "OTEL_EXPORTER_OTLP_ENDPOINT: http://tempo:4317",
    )
    doc.h2("What to Look For")
    doc.bullet([
        "Trace ID in API response headers: X-B3-TraceId",
        "Slow spans (>100ms) indicate DB query or external call issues",
        "Long chains of N+1 queries visible as many short DB spans",
        "Failed traces show error spans in red in Grafana Explore ? Traces",
        "Filter traces by tenant_id tag to isolate per-tenant issues",
    ])


def s40_minio_monitoring(doc: Doc):
    doc.add_page()
    doc.h1("MinIO Storage Monitoring")
    doc.code(
        "# Storage usage per bucket\n"
        "mc alias set local http://localhost:9000 minioadmin minioadmin\n"
        "mc du local/\n\n"
        "# List all buckets with sizes\n"
        "mc ls --summarize local/\n\n"
        "# MinIO health check\n"
        "curl http://localhost:9000/minio/health/live\n"
        "curl http://localhost:9000/minio/health/cluster\n\n"
        "# Admin info (API)\n"
        "mc admin info local",
    )
    doc.h2("Capacity Planning")
    doc.table(
        ["Data Type", "Avg Size", "1K Students/Year"],
        [
            ["Profile photos",       "150 KB", "~150 MB"],
            ["Student documents",    "500 KB", "~500 MB"],
            ["Assignment files",     "200 KB", "~200 MB/term"],
            ["Generated PDF reports","100 KB", "~100 MB/term"],
            ["DB backups (gzip)",    "50 MB",  "~1.8 GB/year (daily)"],
        ],
        col_widths=[55, 30, 85],
    )


def s41_capacity_planning(doc: Doc):
    doc.add_page()
    doc.h1("Capacity Planning")
    doc.table(
        ["Scale", "Tenants", "Students", "Host Spec", "PostgreSQL", "Redis"],
        [
            ["Small",      "1-10",    "1-5K",    "4 vCPU / 8 GB",   "Single",     "Single"],
            ["Medium",     "10-50",   "5-50K",   "8 vCPU / 16 GB",  "Single+read","Single"],
            ["Large",      "50-200",  "50-200K", "16 vCPU / 32 GB", "Primary+2R", "Cluster"],
            ["Enterprise", "200+",    "200K+",   "K8s autoscale",   "RDS Multi-AZ","Elasticache"],
        ],
        col_widths=[25, 20, 22, 40, 40, 23],
    )
    doc.h2("Database Growth Estimates")
    doc.body("Per tenant with 1,000 students, 40 staff, and 1 academic year of data:")
    doc.table(
        ["Table", "Rows/year", "Size"],
        [
            ["attendance_records",    "180,000",  "~50 MB"],
            ["student_marks",         "2,000",    "~1 MB"],
            ["fee_payments",          "12,000",   "~5 MB"],
            ["notification_logs",     "50,000",   "~20 MB"],
            ["ai_usage_logs",         "10,000",   "~5 MB"],
            ["audit_logs",            "500,000",  "~200 MB"],
        ],
        col_widths=[55, 30, 85],
    )


def s42_prod_best_practices(doc: Doc):
    doc.add_page()
    doc.h1("Production Best Practices")
    doc.bullet([
        "Always use SSL/TLS -- Nginx terminates TLS before reaching Spring Boot",
        "Set JWT_SECRET from Vault or AWS Secrets Manager -- never hardcode",
        "Enable PostgreSQL connection pooling via PgBouncer in production",
        "Set Redis maxmemory + eviction policy (allkeys-lru) to prevent OOM",
        "Enable RabbitMQ quorum queues for durability across restarts",
        "Configure MinIO lifecycle rules to delete old backups automatically",
        "Set Spring actuator to only expose health + prometheus (not all endpoints)",
        "Run backend with -XX:+HeapDumpOnOutOfMemoryError for forensics",
        "Use structured logging (logstash-logback-encoder) for ELK/Loki ingestion",
        "Rotate JWT secrets without downtime using dual-secret validation window",
        "Implement database connection retry with exponential backoff",
        "Set app.demo.enabled=false in all production environments",
    ])


def s43_security_best_practices(doc: Doc):
    doc.add_page()
    doc.h1("Security Best Practices")
    doc.bullet([
        "JWT validation on every non-public request -- never skip the filter chain",
        "Passwords hashed with BCrypt cost factor 12 (never MD5, SHA-1, or plain)",
        "Tenant isolation enforced at ORM layer via Hibernate @Filter -- not optional",
        "All PII columns encrypted at rest using AES-256 (V40 migration applied)",
        "Rate limiting on login (5 attempts per 15 min per IP) -- reduces brute force",
        "Audit log every CRUD operation on sensitive data (students, fees, marks)",
        "CORS policy: restrict origins to known frontend domains only",
        "SQL injection impossible via JPA parameterised queries -- no string concatenation",
        "RBAC enforced via @PreAuthorize on every controller method",
        "API keys (Razorpay, Anthropic) stored as environment variables, never committed",
        "Container images scanned with Trivy in CI pipeline before deployment",
        "Regular dependency updates via Dependabot or Renovate to patch CVEs",
    ])
    doc.callout("SECURITY REQUIREMENT: All communication between services inside Docker "
                "network must use internal hostnames. Never expose Postgres/Redis ports to internet.", RED)


def s44_saas_scaling(doc: Doc):
    doc.add_page()
    doc.h1("SaaS Scaling Guidance")
    doc.h2("Scaling Triggers")
    doc.table(
        ["Metric", "Threshold", "Action"],
        [
            ["API P95 latency",        "> 500 ms",   "Add backend replica"],
            ["DB connections",         "> 80% pool", "Add read replica or increase pool"],
            ["Redis memory",           "> 80%",      "Add Redis cluster shard"],
            ["RabbitMQ queue depth",   "> 500 msgs", "Add consumer instance"],
            ["MinIO storage",          "> 80%",      "Add MinIO volume"],
            ["JVM heap",               "> 80%",      "Tune -Xmx or add instance"],
        ],
        col_widths=[50, 35, 85],
    )
    doc.h2("Multi-Region Strategy")
    doc.bullet([
        "Deploy primary region (India -- ap-south-1) for low latency",
        "Replicate PostgreSQL asynchronously to DR region",
        "Use CloudFront/CDN for frontend static assets globally",
        "Tenant data sovereignty: enterprise tenants can request dedicated region",
    ])


def s45_troubleshooting(doc: Doc):
    doc.add_page()
    doc.h1("Troubleshooting Guide")
    doc.table(
        ["Symptom", "Check", "Fix"],
        [
            ["Backend won't start",        "nohup.out / maven log",       "Check Flyway migration errors"],
            ["Login returns 401",          "JWT_SECRET matches across deploys", "Restart with correct secret"],
            ["403 on demo writes",         "Expected -- DemoModeInterceptor","Use non-demo credentials"],
            ["500 INTERNAL_ERROR",         "backend logs correlation ID",  "grep correlation ID in logs"],
            ["Slow API (> 2s)",            "Grafana Trace ? slow DB span", "Add missing index"],
            ["Redis connection refused",   "docker ps | grep redis",       "docker compose up -d redis"],
            ["RabbitMQ consumer lag",      "rabbitmqctl list_queues",      "Restart notification service"],
            ["MinIO upload fails",         "curl minio/health/live",       "Check disk space on host"],
            ["Flyway checksum mismatch",   "flyway_schema_history",        "mvn flyway:repair"],
            ["OOM killed container",       "docker inspect (OOMKilled)",   "Increase Docker memory limit"],
        ],
        col_widths=[45, 55, 70],
    )


def s46_recovery(doc: Doc):
    doc.add_page()
    doc.h1("Recovery Procedures")
    doc.h2("Database Corruption")
    doc.code(
        "1. Stop backend immediately\n"
        "   pkill -f CloudCampusApplication\n\n"
        "2. Take a snapshot of current state\n"
        "   docker exec cloudcampus-postgres-1 \\\n"
        "     pg_dump -U cloudcampus cloudcampus > corrupt_snapshot.sql\n\n"
        "3. Restore from last clean backup\n"
        "   docker exec -i cloudcampus-postgres-1 \\\n"
        "     psql -U cloudcampus -c 'DROP DATABASE cloudcampus;'\n"
        "   docker exec -i cloudcampus-postgres-1 \\\n"
        "     psql -U cloudcampus -c 'CREATE DATABASE cloudcampus;'\n"
        "   gunzip -c backup_YYYYMMDD.sql.gz | \\\n"
        "     docker exec -i cloudcampus-postgres-1 \\\n"
        "     psql -U cloudcampus cloudcampus\n\n"
        "4. Restart backend (Flyway repairs automatically)\n"
        "   mvn spring-boot:run -pl backend",
    )
    doc.h2("Lost Demo Data")
    doc.code(
        "# Force demo reseed\n"
        "docker exec cloudcampus-postgres-1 psql -U cloudcampus cloudcampus \\\n"
        "  -c \"DELETE FROM students WHERE tenant_id='c0000000-0000-0000-0000-000000000001'\"\n"
        "# Then restart backend -- DemoDataSeeder will re-seed automatically",
    )


def s47_alerting(doc: Doc):
    doc.add_page()
    doc.h1("Alerting Architecture")
    doc.h2("Alert Channels")
    doc.table(
        ["Channel", "Tool", "When"],
        [
            ["Email",         "Alertmanager ? SMTP",   "Non-urgent, business hours"],
            ["Slack/Teams",   "Alertmanager ? webhook", "Engineering team alerts"],
            ["PagerDuty",     "Alertmanager ? PD",     "P1 -- requires immediate response"],
            ["Grafana oncall","Grafana OnCall",         "On-call rotation management"],
        ],
        col_widths=[35, 55, 80],
    )
    doc.h2("Critical Alerts (P1 -- Page Immediately)")
    doc.bullet([
        "Backend health check DOWN > 2 minutes",
        "PostgreSQL connection pool exhausted",
        "Disk usage > 90% on any volume",
        "JVM OutOfMemoryError detected in logs",
        "Flyway migration failure on startup",
    ])
    doc.h2("Warning Alerts (P3 -- Slack notification)")
    doc.bullet([
        "API P95 latency > 500ms for 10 minutes",
        "RabbitMQ queue depth > 500 messages",
        "Redis memory > 80% of maxmemory",
        "Failed login rate > 50/min (possible brute force)",
        "AI token spend > $50/day per tenant",
    ])


def s48_backup_strategy(doc: Doc):
    doc.add_page()
    doc.h1("Backup Strategy")
    doc.table(
        ["Component", "Frequency", "Retention", "Storage", "Restore Time"],
        [
            ["PostgreSQL",  "Daily (03:00 AM)",   "30 days",  "MinIO + S3",  "< 1 hour"],
            ["Redis RDB",   "Hourly",             "7 days",   "MinIO",       "< 5 min"],
            ["MinIO data",  "Daily replication",  "90 days",  "S3 Glacier",  "< 2 hours"],
            ["Config files","Git + CI artifacts", "Unlimited","GitHub",      "< 10 min"],
        ],
        col_widths=[30, 35, 25, 35, 45],
    )
    doc.h2("Backup Verification")
    doc.body("Every backup must be tested monthly via restore drill. "
             "An automated restore test runs in a separate Docker environment on the 1st of each month.")
    doc.code(
        "# Automated backup verification (runs in CI monthly)\n"
        "# 1. Download latest backup from MinIO\n"
        "# 2. Restore to test PostgreSQL container\n"
        "# 3. Run smoke test: SELECT COUNT(*) FROM tenants > 0\n"
        "# 4. Report pass/fail to Slack",
    )


def s49_disaster_recovery(doc: Doc):
    doc.add_page()
    doc.h1("Disaster Recovery")
    doc.h2("Recovery Objectives")
    doc.table(
        ["Scenario", "RTO", "RPO"],
        [
            ["Single container crash",  "< 1 min",  "0 (stateless)"],
            ["Host machine failure",     "< 15 min", "< 1 hour (last backup)"],
            ["Data center outage",       "< 2 hours","< 1 hour"],
            ["Ransomware / data loss",  "< 4 hours","< 24 hours"],
        ],
        col_widths=[70, 30, 70],
    )
    doc.h2("DR Runbook")
    doc.code(
        "Step 1 -- Declare incident, notify stakeholders\n"
        "Step 2 -- Assess blast radius: which tenants affected?\n"
        "Step 3 -- Provision replacement infrastructure (Terraform)\n"
        "Step 4 -- Restore PostgreSQL from latest MinIO backup\n"
        "Step 5 -- Restore Redis from RDB snapshot (or accept cold start)\n"
        "Step 6 -- Deploy backend (Docker image from registry)\n"
        "Step 7 -- Run Flyway migrations (idempotent -- safe to re-run)\n"
        "Step 8 -- Run smoke tests: /actuator/health, login, student list\n"
        "Step 9 -- Update DNS / load balancer to new IP\n"
        "Step 10 -- Notify tenants, monitor for 30 minutes\n"
        "Step 11 -- Post-mortem within 48 hours",
    )


def s50_deployment_checklist(doc: Doc):
    doc.add_page()
    doc.h1("Enterprise Deployment Checklist")
    doc.h2("Pre-Deployment")
    doc.bullet([
        "[ ] All environment variables set in target environment",
        "[ ] JWT_SECRET is unique, random, and at least 64 characters",
        "[ ] app.demo.enabled=false in production",
        "[ ] SSL certificate installed and verified",
        "[ ] Database backup taken before deployment",
        "[ ] Flyway migration dry-run completed (mvn flyway:info)",
        "[ ] Load test run against staging: 500 concurrent users",
        "[ ] Security scan: OWASP ZAP or Burp Suite against staging",
        "[ ] Container images scanned with Trivy",
    ])
    doc.h2("Deployment")
    doc.bullet([
        "[ ] Blue-green deployment: bring up new version alongside old",
        "[ ] Health check passes: /actuator/health returns UP",
        "[ ] Flyway migrations complete without errors",
        "[ ] DemoDataSeeder skipped (guard: student count >= 100 or demo disabled)",
        "[ ] Smoke tests pass: login, student list, fee list",
    ])
    doc.h2("Post-Deployment")
    doc.bullet([
        "[ ] Monitor Grafana for 30 minutes -- no anomalies",
        "[ ] Error rate = 0% on /actuator/prometheus",
        "[ ] P95 API latency < 200ms on core endpoints",
        "[ ] RabbitMQ queues empty (no consumer lag)",
        "[ ] Notify stakeholders -- deployment complete",
        "[ ] Update CHANGELOG.md and tag Git release",
        "[ ] Archive deployment log",
    ])
    doc.callout("CloudCampus is production-ready when all checklist items are ?. "
                "Never skip items under time pressure -- each protects against a real failure mode.", GREEN)


# ?? Final TOC page (written to page 2 after all pages are built) ???????????????

def write_toc(doc: Doc, toc_entries):
    """Write TOC content -- called on page 2 using set_page()."""
    # We can't easily rewrite an existing page with fpdf2, so we output TOC
    # at the end as an appendix page instead.
    doc.add_page()
    doc.set_font("Helvetica", "B", 16)
    doc.set_text_color(*NAVY)
    doc.cell(0, 10, "Section Index", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    doc.set_draw_color(*BLUE)
    doc.line(20, doc.get_y(), 190, doc.get_y())
    doc.ln(3)
    doc.set_font("Helvetica", "", 9)
    for (title, pg) in toc_entries:
        doc.set_text_color(*NAVY)
        dots = "." * max(2, 80 - len(title) - len(str(pg)))
        doc.cell(0, 5.5, f"{title} {dots} {pg}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    doc.ln(5)


# ?? Main ???????????????????????????????????????????????????????????????????????

def main():
    doc = Doc()

    # Cover
    cover(doc)

    # All 50 sections
    sections = [
        s01_platform_overview, s02_architecture_overview, s03_multitenant,
        s04_school_setup, s05_demo_tenant_strategy, s06_seeder_architecture,
        s07_docker_setup, s08_postgres_setup, s09_redis_setup, s10_rabbitmq_setup,
        s11_minio_setup, s12_frontend_setup, s13_mobile_setup, s14_ai_module,
        s15_feature_flags, s16_subscription, s17_branding, s18_auth_flow,
        s19_jwt_security, s20_demo_reset, s21_cicd, s22_env_vars,
        s23_production_deploy, s24_monitoring, s25_backup_restore,
        s26_scaling, s27_demo_flow, s28_readonly_protection, s29_infra_monitoring,
        s30_docker_troubleshoot, s31_health_checks, s32_memory_analysis,
        s33_jvm_monitoring, s34_postgres_monitoring, s35_redis_monitoring,
        s36_rabbitmq_monitoring, s37_prometheus, s38_grafana, s39_tempo_tracing,
        s40_minio_monitoring, s41_capacity_planning, s42_prod_best_practices,
        s43_security_best_practices, s44_saas_scaling, s45_troubleshooting,
        s46_recovery, s47_alerting, s48_backup_strategy, s49_disaster_recovery,
        s50_deployment_checklist,
    ]

    for fn in sections:
        fn(doc)

    # Append section index at end
    write_toc(doc, doc._toc)

    doc.output(OUTPUT)
    print(f"? PDF generated: {OUTPUT}")
    print(f"  Pages: {doc.page_no()}")
    print(f"  Sections: {len(doc._toc)}")


if __name__ == "__main__":
    main()
