# Greenwood International School — Demo Credentials

Enterprise demo tenant auto-seeded on every fresh startup when `app.demo.enabled=true`.

---

## Tenant Details

| Field        | Value                              |
|--------------|------------------------------------|
| Tenant Code  | `greenwood-demo`                   |
| School       | Greenwood International School     |
| Location     | Banjara Hills, Hyderabad, Telangana|
| Plan         | Enterprise (all features enabled)  |

---

## Login Credentials

All demo accounts share the same password: **`Demo@1234`**

| Role         | Username          | Portal                         |
|--------------|-------------------|--------------------------------|
| School Admin | `gw.admin`        | `/school-admin/dashboard`      |
| Teacher 1    | `gw.teacher001`   | `/teacher/dashboard`           |
| Teacher 2    | `gw.teacher002`   | `/teacher/dashboard`           |
| Student      | `gw.student001`   | `/student/dashboard`           |
| Parent       | `gw.parent001`    | `/parent/dashboard`            |

Additional teachers: `gw.teacher001` to `gw.teacher040` (all use `Demo@1234`).

---

## Demo Data Summary

| Module           | Count                                         |
|------------------|-----------------------------------------------|
| Grades           | 15 (Nursery, LKG, UKG, Class 1–12)           |
| Sections         | 45 (3 per grade: A, B, C)                    |
| Students         | 1 125 total (25 per section)                  |
| Teachers/Staff   | 40 teachers + 1 admin                         |
| Subjects         | 10 (Math, Science, English, Hindi, SST, CS, Physics, Chemistry, Biology, PE) |
| Attendance       | 20 working days (90% present rate)            |
| Exams            | 2 (Unit Test 1, Mid-Term)                     |
| Lesson Plans     | 10 (PUBLISHED)                               |
| Homework         | 3 assignments                                 |
| School Notices   | 5 (published)                                 |
| Fee Structures   | 3 tiers (Pre-Primary, Primary, Secondary)     |

---

## Read-Only Demo Mode

The demo tenant is **read-only for write operations**.  POST / PUT / PATCH / DELETE
requests from a `greenwood-demo` JWT are rejected with HTTP 403:

```json
{
  "success": false,
  "error": {
    "code": "DEMO_READ_ONLY",
    "message": "This is a read-only demo environment. Write operations are disabled."
  }
}
```

Auth endpoints (`/v1/auth/**`) are always permitted so login/refresh work normally.

---

## Nightly Reset

`DemoResetScheduler` runs at **02:00 AM** server time.  It:

1. Deletes transient data: attendance, marks, exams, lesson plans, homework, notices
2. Preserves structural data: tenant, school, classes, sections, subjects, users
3. Re-seeds all transient data via `DemoDataSeeder`

Named demo students (`GW-0001` to `GW-0005`) are preserved across resets so
bookmarked student portal sessions remain valid.

---

## Development Setup

Enable the demo school in `application-dev.yml`:

```yaml
app:
  demo:
    enabled: true
```

On startup you will see:

```
DEMO: Seeding Greenwood International School enterprise demo data...
DEMO: Greenwood demo school seeded in 3241 ms.
```

On subsequent restarts (students already exist):

```
DEMO: Greenwood demo school already seeded — skipping.
```

To force a full re-seed, delete the students:

```sql
DELETE FROM students WHERE tenant_id = 'c0000000-0000-0000-0000-000000000001';
```

Then restart the backend.

---

## Known Stable UUIDs

Useful for Postman / integration tests:

| Resource         | UUID                                   |
|------------------|----------------------------------------|
| Tenant ID        | `c0000000-0000-0000-0000-000000000001` |
| School ID        | `c0000000-0000-0000-0000-000000000002` |
| Academic Year ID | `c0000000-0000-0000-0000-000000000003` |
| Admin User ID    | `c0000000-0000-0000-0000-000000000010` |
| Teacher 1 User   | `c0000000-0000-0000-0000-000000000011` |
| Student 1 User   | `c0000000-0000-0000-0000-000000000020` |
| Parent 1 User    | `c0000000-0000-0000-0000-000000000030` |
