# CloudCampus — Demo Credentials & Bulk Data

> Generated: 2026-04-30 | Re-run: `python3 /tmp/seed_cloudcampus.py`
> Seed script is at `/tmp/seed_cloudcampus.py` (copy to `scripts/seed_demo.py` to persist).

---

## Super Admin

| Field | Value |
|-------|-------|
| URL | http://localhost:5173/super-admin/login |
| username | `superadmin` |
| password | `SuperAdmin_Docker_2026!` |

> **Note:** Super Admin login does **not** require `X-Tenant-Slug`.

---

## School 1 — Sunrise Academy

| Field | Value |
|-------|-------|
| Tenant ID | `sunrise-academy` |
| Schema (X-Tenant-Slug) | `sunrise` |
| Login URL | http://localhost:5173/login |

### School Admin
| username | password |
|----------|----------|
| `priya.sharma` | `Sunrise@2026!` |

### Teachers
| Username | Password | Subject |
|----------|----------|---------|
| `sunita.aggarwal` | `Sunita@Teacher126!` | Math |
| `vikram.desai` | `Vikram@Teacher226!` | Science |
| `lakshmi.krishnan` | `Lakshmi@Teacher326!` | English |
| `rajesh.bose` | `Rajesh@Teacher426!` | History |
| `anita.pillai` | `Anita@Teacher526!` | Geography |
| `deepak.chauhan` | `Deepak@Teacher626!` | Physics |

### Students (with login)
| Username | Password | Admission No |
|----------|----------|-------------|
| `aarav.sharma1` | `Aarav@Student126!` | SUN-S001 |
| `diya.patel2` | `Diya@Student226!` | SUN-S002 |
| `kabir.singh3` | `Kabir@Student326!` | SUN-S003 |
| `ananya.kumar4` | `Ananya@Student426!` | SUN-S004 |
| `vivaan.verma5` | `Vivaan@Student526!` | SUN-S005 |

### Parents (linked to students)
| Username | Password | Linked Student |
|----------|----------|----------------|
| `ramesh.sharma1` | `Ramesh@Parent126!` | SUN-S001 (Aarav Sharma) |
| `sujata.patel2` | `Sujata@Parent226!` | SUN-S002 (Diya Patel) |
| `vijay.singh3` | `Vijay@Parent326!` | SUN-S003 (Kabir Singh) |

### Bulk Data Loaded (via Excel upload)
- **15 students** (SUN-S001 … SUN-S015)
- **6 teachers** (SUN-T01 … SUN-T06)
- **3 parents** (ramesh.sharma1, sujata.patel2, vijay.singh3)
- **5 classes**: Grade 1, Grade 3, Grade 5, Grade 7, Grade 10
- **10 sections**: A & B per class

---

## School 2 — Greenwood High

| Field | Value |
|-------|-------|
| Tenant ID | `greenwood-high` |
| Schema (X-Tenant-Slug) | `school_greenwood-high` |
| Login URL | http://localhost:5173/login |

### School Admin
| username | password |
|----------|----------|
| `arjun.mehta` | `Greenwood@2026!` |

### Teachers
| Username | Password | Subject |
|----------|----------|---------|
| `sunita.aggarwal` | `Sunita@Teacher126!` | Math |
| `vikram.desai` | `Vikram@Teacher226!` | Science |
| `lakshmi.krishnan` | `Lakshmi@Teacher326!` | English |
| `rajesh.bose` | `Rajesh@Teacher426!` | History |
| `anita.pillai` | `Anita@Teacher526!` | Geography |
| `deepak.chauhan` | `Deepak@Teacher626!` | Physics |

### Students (with login)
| Username | Password | Admission No |
|----------|----------|-------------|
| `aarav.sharma1` | `Aarav@Student126!` | GWH-S001 |
| `diya.patel2` | `Diya@Student226!` | GWH-S002 |
| `kabir.singh3` | `Kabir@Student326!` | GWH-S003 |
| `ananya.kumar4` | `Ananya@Student426!` | GWH-S004 |
| `vivaan.verma5` | `Vivaan@Student526!` | GWH-S005 |

### Parents (linked to students)
| Username | Password | Linked Student |
|----------|----------|----------------|
| `ramesh.sharma1` | `Ramesh@Parent126!` | GWH-S001 (Aarav Sharma) |
| `sujata.patel2` | `Sujata@Parent226!` | GWH-S002 (Diya Patel) |
| `vijay.singh3` | `Vijay@Parent326!` | GWH-S003 (Kabir Singh) |

### Bulk Data Loaded
- **15 students** (GWH-S001 … GWH-S015)
- **6 teachers** (GWH-T01 … GWH-T06)
- **3 parents** (ramesh.sharma1, sujata.patel2, vijay.singh3)
- **5 classes** + **10 sections** (A & B each)

---

## School 3 — Riverdale Public School

| Field | Value |
|-------|-------|
| Tenant ID | `riverdale-public` |
| Schema (X-Tenant-Slug) | `school_riverdale-public` |
| Login URL | http://localhost:5173/login |

### School Admin
| username | password |
|----------|----------|
| `kavya.nair` | `Riverdale@2026!` |

### Teachers
| Username | Password | Subject |
|----------|----------|---------|
| `sunita.aggarwal` | `Sunita@Teacher126!` | Math |
| `vikram.desai` | `Vikram@Teacher226!` | Science |
| `lakshmi.krishnan` | `Lakshmi@Teacher326!` | English |
| `rajesh.bose` | `Rajesh@Teacher426!` | History |
| `anita.pillai` | `Anita@Teacher526!` | Geography |
| `deepak.chauhan` | `Deepak@Teacher626!` | Physics |

### Students (with login)
| Username | Password | Admission No |
|----------|----------|-------------|
| `aarav.sharma1` | `Aarav@Student126!` | RVD-S001 |
| `diya.patel2` | `Diya@Student226!` | RVD-S002 |
| `kabir.singh3` | `Kabir@Student326!` | RVD-S003 |
| `ananya.kumar4` | `Ananya@Student426!` | RVD-S004 |
| `vivaan.verma5` | `Vivaan@Student526!` | RVD-S005 |

### Parents (linked to students)
| Username | Password | Linked Student |
|----------|----------|----------------|
| `ramesh.sharma1` | `Ramesh@Parent126!` | RVD-S001 (Aarav Sharma) |
| `sujata.patel2` | `Sujata@Parent226!` | RVD-S002 (Diya Patel) |
| `vijay.singh3` | `Vijay@Parent326!` | RVD-S003 (Kabir Singh) |

### Bulk Data Loaded
- **15 students** (RVD-S001 … RVD-S015)
- **6 teachers** (RVD-T01 … RVD-T06)
- **3 parents** (ramesh.sharma1, sujata.patel2, vijay.singh3)
- **5 classes** + **10 sections** (A & B each)

---

## School 4 — Oakridge International

| Field | Value |
|-------|-------|
| Tenant ID | `oakridge-international` |
| Schema (X-Tenant-Slug) | `school_oakridge-international` |
| Login URL | http://localhost:5173/login |

### School Admin
| username | password |
|----------|----------|
| `rohan.kapoor` | `Oakridge@2026!` |

### Teachers
| Username | Password | Subject |
|----------|----------|---------|
| `sunita.aggarwal` | `Sunita@Teacher126!` | Math |
| `vikram.desai` | `Vikram@Teacher226!` | Science |
| `lakshmi.krishnan` | `Lakshmi@Teacher326!` | English |
| `rajesh.bose` | `Rajesh@Teacher426!` | History |
| `anita.pillai` | `Anita@Teacher526!` | Geography |
| `deepak.chauhan` | `Deepak@Teacher626!` | Physics |

### Students (with login)
| Username | Password | Admission No |
|----------|----------|-------------|
| `aarav.sharma1` | `Aarav@Student126!` | OAK-S001 |
| `diya.patel2` | `Diya@Student226!` | OAK-S002 |
| `kabir.singh3` | `Kabir@Student326!` | OAK-S003 |
| `ananya.kumar4` | `Ananya@Student426!` | OAK-S004 |
| `vivaan.verma5` | `Vivaan@Student526!` | OAK-S005 |

### Parents (linked to students)
| Username | Password | Linked Student |
|----------|----------|----------------|
| `ramesh.sharma1` | `Ramesh@Parent126!` | OAK-S001 (Aarav Sharma) |
| `sujata.patel2` | `Sujata@Parent226!` | OAK-S002 (Diya Patel) |
| `vijay.singh3` | `Vijay@Parent326!` | OAK-S003 (Kabir Singh) |

### Bulk Data Loaded
- **15 students** (OAK-S001 … OAK-S015)
- **6 teachers** (OAK-T01 … OAK-T06)
- **3 parents** (ramesh.sharma1, sujata.patel2, vijay.singh3)
- **5 classes** + **10 sections** (A & B each)

---

## Postman / curl Quick Start

```bash
# 1. Super Admin login (no X-Tenant-Slug)
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"SuperAdmin_Docker_2026!"}'

# 2. School Admin login (include X-Tenant-Slug)
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: school_greenwood-high" \
  -d '{"username":"arjun.mehta","password":"Greenwood@2026!"}'

# 3. Teacher login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: school_greenwood-high" \
  -d '{"username":"sunita.aggarwal","password":"Sunita@Teacher126!"}'

# 4. Student login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: school_greenwood-high" \
  -d '{"username":"aarav.sharma1","password":"Aarav@Student126!"}'\n
# 5. Parent login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: school_greenwood-high" \
  -d '{"username":"ramesh.sharma1","password":"Ramesh@Parent126!"}'

# 6. Parent — view linked children (after login, use returned token)
curl http://localhost:8080/api/v1/parents/me/children \
  -H "Authorization: Bearer <parent_token>" \
  -H "X-Tenant-Slug: school_greenwood-high"
```

---

## Data Summary

| School | Students | Teachers | Parents | Classes | Sections | Plan |
|--------|----------|----------|---------|---------|----------|------|
| Sunrise Academy | 15 | 6 | 3 | 5 | 10 | BASIC |
| Greenwood High | 15 | 6 | 3 | 5 | 10 | BASIC |
| Riverdale Public | 15 | 6 | 3 | 5 | 10 | BASIC |
| Oakridge International | 15 | 6 | 3 | 5 | 10 | BASIC |
| **Total** | **60** | **24** | **12** | **20** | **40** | |

> Students with login accounts: first 5 per school. Parents: 3 per school, each linked to one student (same usernames across tenants — accounts are schema-isolated).
