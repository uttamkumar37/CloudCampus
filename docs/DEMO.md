# Demo Data & Credentials

Local development uses **Sunrise Academy** as the primary demo school, seeded by `scripts/seed_dashboard_data.py`.

---

## Quick Login Reference

### Super Admin

| URL | Username | Password |
|---|---|---|
| [http://localhost:5173/super-admin/login](http://localhost:5173/super-admin/login) | `superadmin` | `SuperAdmin_Docker_2026!` |

> Super Admin credentials are set via `BOOTSTRAP_ADMIN_USERNAME` / `BOOTSTRAP_ADMIN_PASSWORD` in `.env`.
> No school selection needed.

### Sunrise Academy School Users

Login URL: [http://localhost:5173/login](http://localhost:5173/login) — select school **Sunrise Academy**

| Role | Username | Password |
|---|---|---|
| School Admin | `priya.sharma` | `Demo@2026!` |
| Teacher | `sunita.aggarwal` | `Demo@2026!` |
| Teacher | `vikram.teacher` | `Demo@2026!` |
| Teacher | `deepak.teacher` | `Demo@2026!` |
| Student | `aarav.student` | `Demo@2026!` |
| Student | `siddharth.student` | `Demo@2026!` |
| Parent | `ramesh.parent` | `Demo@2026!` |
| Parent | `mukesh.parent` | `Demo@2026!` |

> All school user passwords: **`Demo@2026!`**

---

## Sunrise Academy — School Profile

| Property | Value |
|---|---|
| School Name | Sunrise Academy |
| Tenant Slug | `sunrise-academy` |
| DB Schema | `sunrise` |
| Theme Color | `#2563EB` |
| Public Website | [http://localhost:5173/school/sunrise-academy](http://localhost:5173/school/sunrise-academy) |

---

## Seeded Academic Data

### Teachers (10)

| Username | Full Name | Subjects |
|---|---|---|
| `sunita.aggarwal` | Sunita Aggarwal | Mathematics |
| `vikram.teacher` | Vikram Desai | Science, Biology |
| `lakshmi.teacher` | Lakshmi Krishnan | English |
| `rahul.teacher` | Rahul Mehta | History, Chemistry |
| `asha.teacher` | Asha Nair | Hindi, Geography |
| `deepak.teacher` | Deepak Gupta | Computer Science |
| `meena.teacher` | Meena Pillai | Art & Craft |
| `arjun.teacher` | Arjun Verma | Physical Education |
| `pooja.teacher` | Pooja Iyer | Hindi (Grade 5) |
| `suresh.teacher` | Suresh Rao | Physics |

### Students (15)

Admission numbers `SUN-S001` to `SUN-S015` across Grades 1–10.
Usernames: `aarav.student`, `diya.student`, `kabir.student`, `ananya.student`, `rohan.student`, `priya.student`, `aryan.student`, `sneha.student`, `vikrant.student`, `riya.student`, `harsh.student`, `pooja.student`, `aditya.student`, `kavya.student`, `siddharth.student`

### Parents (7)

| Username | Linked Students |
|---|---|
| `ramesh.parent` | Aarav Sharma |
| `sujata.parent` | Diya Patel |
| `mukesh.parent` | Kabir Singh, Ananya Roy |
| `geeta.parent` | Rohan Kumar |
| `naveen.parent` | Priya Joshi, Aryan Mehta |
| `anita.parent` | Sneha Gupta, Vikrant Nair |
| `rajesh.parent` | Riya Iyer |

### Academic Structure

- **Classes:** Grade 1–10 (10 grades, 18 sections)
- **Subjects:** Mathematics, Science, English, Hindi, History, Geography, Physics, Chemistry, Biology, Computer Science, Art & Craft, Physical Education
- **Exams:** 14 exams with 29 result entries (Grades 1, 3, 5, 10)
- **Fees:** 24 assignments, 15 payments across all fee statuses
- **Homework:** 16 assignments across Grade 1, 3, 5, 10
- **Timetable:** Full week coverage for Grade 1-A, 5-A, 10-A
- **Attendance:** 30 school days for 15 students

### Website / CMS

| Property | Value |
|---|---|
| Tagline | "Enlightening Minds, Building Futures" |
| Email | info@sunriseacademy.edu.in |
| Phone | +91 98765 43210 |
| Address | 12, Knowledge Park, Sector 18, Noida, UP – 201301 |
| Admissions Open | Yes |
| Gallery | 8 photos (Science Exhibition, Cricket, Board Felicitation, Annual Day, Robotics, Library, Art, Classroom) |
| Admission Leads | 12 sample leads |

---

## Seeding Commands

```bash
# Full dashboard seed — Sunrise Academy (recommended)
python3 scripts/seed_dashboard_data.py

# Minimal seed — single school, compact dataset
python3 scripts/seed_demo.py
```

Both scripts are idempotent — safe to re-run. Existing entities are reused.

For a clean slate, reset the database first:

```bash
docker compose down -v && docker compose up --build
```

---

## Other Demo Tenants (minimal seed only)

| Slug | Schema | Notes |
|---|---|---|
| `cloudcampus-demo-school` | `school_cloudcampus_demo_school` | Created by `seed_demo.py` |
| `greenwood-high` | `greenwood` | Reference only |
| `riverdale-public` | `riverdale` | Reference only |
| `oakridge-international` | `oakridge` | Reference only |
