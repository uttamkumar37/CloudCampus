# CloudCampus — Demo Dummy Data Reference

All demo data is auto-seeded on startup when `APP_SEED_DEMO_ENABLED=true`.
Default password for **every** demo account: `Demo@2026!`

---

## How to Log In

**API endpoint:** `POST http://localhost:8080/api/v1/auth/login`

```json
{
  "username": "<username>",
  "password": "Demo@2026!",
  "tenantSlug": "sunrise-academy"
}
```

> Super Admin does **not** need `tenantSlug`.

---

## Super Admin (Platform Level)

| Field    | Value                              |
|----------|------------------------------------|
| Username | set via `BOOTSTRAP_ADMIN_USERNAME` |
| Password | set via `BOOTSTRAP_ADMIN_PASSWORD` |
| Role     | `SUPER_ADMIN`                      |
| Tenant   | — (platform level, no school)      |

---

## Demo School — Sunrise Academy

| Property    | Value             |
|-------------|-------------------|
| School Name | Sunrise Academy   |
| Tenant ID   | `sunrise-academy` |
| Tenant Slug | `sunrise-academy` |
| Schema      | `sunrise`         |
| Theme Color | `#2563EB`         |

---

## School Admin

| Username           | Full Name    | Email                | Phone      | Role           |
|--------------------|--------------|----------------------|------------|----------------|
| `priya.schooladmin`| Priya Sharma | priya@sunrise.edu    | 9000000001 | `SCHOOL_ADMIN` |

> **Note:** Internal DB username is `priya.sharma` — this table shows the intended readable format.

---

## Teachers (10)

| Username             | Full Name        | Email                  | Phone      | Employee No | Hire Date  |
|----------------------|------------------|------------------------|------------|-------------|------------|
| `sunita.teacher`     | Sunita Aggarwal  | sunita@sunrise.edu     | 9000000101 | SUN-T01     | ~5 yrs ago |
| `vikram.teacher`     | Vikram Desai     | vikram@sunrise.edu     | 9000000102 | SUN-T02     | ~4 yrs ago |
| `lakshmi.teacher`    | Lakshmi Krishnan | lakshmi@sunrise.edu    | 9000000103 | SUN-T03     | ~6 yrs ago |
| `rahul.teacher`      | Rahul Mehta      | rahul@sunrise.edu      | 9000000104 | SUN-T04     | ~3 yrs ago |
| `asha.teacher`       | Asha Nair        | asha@sunrise.edu       | 9000000105 | SUN-T05     | ~7 yrs ago |
| `deepak.teacher`     | Deepak Gupta     | deepak@sunrise.edu     | 9000000106 | SUN-T06     | ~2 yrs ago |
| `meena.teacher`      | Meena Pillai     | meena@sunrise.edu      | 9000000107 | SUN-T07     | ~8 yrs ago |
| `arjun.teacher`      | Arjun Verma      | arjun@sunrise.edu      | 9000000108 | SUN-T08     | ~1 yr ago  |
| `pooja.teacher`      | Pooja Iyer       | pooja@sunrise.edu      | 9000000109 | SUN-T09     | ~4 yrs ago |
| `suresh.teacher`     | Suresh Rao       | suresh@sunrise.edu     | 9000000110 | SUN-T10     | ~10 yrs ago|

### Subject Assignments (by teacher)

| Teacher          | Subjects Taught                        |
|------------------|----------------------------------------|
| `sunita.teacher` | Mathematics                            |
| `vikram.teacher` | Science, Biology                       |
| `lakshmi.teacher`| English                                |
| `rahul.teacher`  | History, Chemistry                     |
| `asha.teacher`   | Hindi, Geography                       |
| `deepak.teacher` | Computer Science                       |
| `meena.teacher`  | Art & Craft                            |
| `arjun.teacher`  | Physical Education                     |
| `pooja.teacher`  | Hindi (Grade 5)                        |
| `suresh.teacher` | Physics                                |

---

## Students (15)

| Username               | Full Name       | Email                       | Phone      | Admission No | DOB        | Gender |
|------------------------|-----------------|-----------------------------|------------|--------------|------------|--------|
| `aarav.student`        | Aarav Sharma    | aarav@sunrise.edu           | 9000000201 | SUN-S001     | 2015-06-10 | Male   |
| `diya.student`         | Diya Patel      | diya@sunrise.edu            | 9000000202 | SUN-S002     | 2015-11-02 | Female |
| `kabir.student`        | Kabir Singh     | kabir@sunrise.edu           | 9000000203 | SUN-S003     | 2014-03-22 | Male   |
| `ananya.student`       | Ananya Roy      | ananya@sunrise.edu          | 9000000204 | SUN-S004     | 2014-07-15 | Female |
| `rohan.student`        | Rohan Kumar     | rohan@sunrise.edu           | 9000000205 | SUN-S005     | 2013-01-30 | Male   |
| `priya.student`        | Priya Joshi     | priyaj@sunrise.edu          | 9000000206 | SUN-S006     | 2013-09-05 | Female |
| `aryan.student`        | Aryan Mehta     | aryan@sunrise.edu           | 9000000207 | SUN-S007     | 2012-04-18 | Male   |
| `sneha.student`        | Sneha Gupta     | sneha@sunrise.edu           | 9000000208 | SUN-S008     | 2012-08-27 | Female |
| `vikrant.student`      | Vikrant Nair    | vikrant@sunrise.edu         | 9000000209 | SUN-S009     | 2011-02-14 | Male   |
| `riya.student`         | Riya Iyer       | riya@sunrise.edu            | 9000000210 | SUN-S010     | 2011-05-20 | Female |
| `harsh.student`        | Harsh Pandey    | harsh@sunrise.edu           | 9000000211 | SUN-S011     | 2010-06-03 | Male   |
| `pooja.student`        | Pooja Mishra    | pooja.mishra@sunrise.edu    | 9000000212 | SUN-S012     | 2010-10-11 | Female |
| `aditya.student`       | Aditya Das      | aditya@sunrise.edu          | 9000000213 | SUN-S013     | 2009-03-25 | Male   |
| `kavya.student`        | Kavya Menon     | kavya@sunrise.edu           | 9000000214 | SUN-S014     | 2009-08-08 | Female |
| `siddharth.student`    | Siddharth Rao   | siddharth@sunrise.edu       | 9000000215 | SUN-S015     | 2008-12-17 | Male   |

---

## Parents (7)

| Username           | Full Name     | Email                   | Phone      | Linked Students                    |
|--------------------|---------------|-------------------------|------------|------------------------------------|
| `ramesh.parent`    | Ramesh Sharma | ramesh.p@sunrise.edu    | 9000000301 | Aarav Sharma                       |
| `sujata.parent`    | Sujata Patel  | sujata.p@sunrise.edu    | 9000000302 | Diya Patel                         |
| `mukesh.parent`    | Mukesh Singh  | mukesh.p@sunrise.edu    | 9000000303 | Kabir Singh, Ananya Roy            |
| `geeta.parent`     | Geeta Roy     | geeta.p@sunrise.edu     | 9000000304 | Rohan Kumar                        |
| `naveen.parent`    | Naveen Kumar  | naveen.p@sunrise.edu    | 9000000305 | Priya Joshi, Aryan Mehta           |
| `anita.parent`     | Anita Joshi   | anita.p@sunrise.edu     | 9000000306 | Sneha Gupta, Vikrant Nair          |
| `rajesh.parent`    | Rajesh Mehta  | rajesh.p@sunrise.edu    | 9000000307 | Riya Iyer                          |

---

## Academic Structure

### Classes & Sections (10 grades, 18 sections)

| Class    | Code | Sections        |
|----------|------|-----------------|
| Grade 1  | G01  | A, B, C         |
| Grade 2  | G02  | A, B            |
| Grade 3  | G03  | A, B, C         |
| Grade 4  | G04  | A, B            |
| Grade 5  | G05  | A, B            |
| Grade 6  | G06  | A, B            |
| Grade 7  | G07  | A               |
| Grade 8  | G08  | A, B            |
| Grade 9  | G09  | A               |
| Grade 10 | G10  | A               |

### Subjects (12)

| Name                | Code |
|---------------------|------|
| Mathematics         | MATH |
| Science             | SCI  |
| English             | ENG  |
| Hindi               | HIN  |
| History             | HIST |
| Geography           | GEO  |
| Physics             | PHY  |
| Chemistry           | CHEM |
| Biology             | BIO  |
| Computer Science    | CS   |
| Art & Craft         | ART  |
| Physical Education  | PE   |

---

## Exams (14)

| Title                        | Class    | Section | Subject     | Max Marks | Date           |
|------------------------------|----------|---------|-------------|-----------|----------------|
| Unit Test 1 - Mathematics    | Grade 1  | A       | Mathematics | 100       | ~60 days ago   |
| Unit Test 1 - English        | Grade 1  | A       | English     | 100       | ~58 days ago   |
| Mid-Term - Mathematics       | Grade 3  | A       | Mathematics | 100       | ~45 days ago   |
| Mid-Term - Science           | Grade 3  | A       | Science     | 100       | ~44 days ago   |
| Mid-Term - English           | Grade 3  | A       | English     | 100       | ~43 days ago   |
| Final Exam - Mathematics     | Grade 5  | A       | Mathematics | 100       | ~15 days ago   |
| Final Exam - Science         | Grade 5  | A       | Science     | 100       | ~14 days ago   |
| Final Exam - History         | Grade 5  | A       | History     | 100       | ~13 days ago   |
| Board Mock - Physics         | Grade 10 | A       | Physics     | 100       | ~30 days ago   |
| Board Mock - Chemistry       | Grade 10 | A       | Chemistry   | 100       | ~29 days ago   |
| Board Mock - Mathematics     | Grade 10 | A       | Mathematics | 100       | ~28 days ago   |
| Board Mock - Biology         | Grade 10 | A       | Biology     | 100       | ~27 days ago   |
| Unit Test 2 - Mathematics    | Grade 1  | B       | Mathematics | 50        | ~20 days ago   |
| Unit Test 2 - Hindi          | Grade 3  | B       | Hindi       | 50        | ~19 days ago   |

### Exam Results (29 entries)

Results published for students in Grades 1, 3, 5, and 10.
Score range: 65–98 across all exams.

---

## Fees (24 assignments, 15 payments)

| Student          | Fee Title              | Amount (₹) | Status           | Payment Method  |
|------------------|------------------------|------------|------------------|-----------------|
| `aarav.student`  | Term 1 Tuition Fee     | 15,000     | PAID             | BANK_TRANSFER   |
| `aarav.student`  | Activity Fee           | 2,500      | PAID             | CASH            |
| `aarav.student`  | Term 2 Tuition Fee     | 15,000     | PENDING          | —               |
| `diya.student`   | Term 1 Tuition Fee     | 15,000     | PAID             | CASH            |
| `diya.student`   | Exam Fee               | 1,500      | PAID             | BANK_TRANSFER   |
| `diya.student`   | Term 2 Tuition Fee     | 15,000     | PENDING          | —               |
| `kabir.student`  | Term 1 Tuition Fee     | 18,000     | PARTIALLY PAID   | CASH            |
| `kabir.student`  | Library Fee            | 500        | PAID             | CASH            |
| `ananya.student` | Term 1 Tuition Fee     | 18,000     | PAID             | CHEQUE          |
| `ananya.student` | Sports Fee             | 1,000      | PAID             | CASH            |
| `rohan.student`  | Term 1 Tuition Fee     | 20,000     | PAID             | BANK_TRANSFER   |
| `rohan.student`  | Term 2 Tuition Fee     | 20,000     | PENDING          | —               |
| `rohan.student`  | Exam Fee               | 2,000      | PAID             | CASH            |
| `priya.student`  | Term 1 Tuition Fee     | 20,000     | PARTIALLY PAID   | CASH            |
| `aryan.student`  | Term 1 Tuition Fee     | 22,000     | PAID             | BANK_TRANSFER   |
| `aryan.student`  | Lab Fee                | 1,500      | PAID             | CASH            |
| `sneha.student`  | Term 1 Tuition Fee     | 22,000     | PAID             | CHEQUE          |
| `vikrant.student`| Term 1 Tuition Fee     | 25,000     | PENDING          | —               |
| `riya.student`   | Term 1 Tuition Fee     | 25,000     | PAID             | BANK_TRANSFER   |
| `harsh.student`  | Term 1 Tuition Fee     | 28,000     | PAID             | BANK_TRANSFER   |
| `pooja.student`  | Term 1 Tuition Fee     | 28,000     | PARTIALLY PAID   | CASH            |
| `aditya.student` | Term 1 Tuition Fee     | 28,000     | PAID             | CHEQUE          |
| `kavya.student`  | Term 1 Tuition Fee     | 28,000     | PAID             | BANK_TRANSFER   |
| `siddharth.student`| Term 1 Tuition Fee   | 28,000     | PAID             | BANK_TRANSFER   |
| `siddharth.student`| Board Exam Fee       | 3,000      | PAID             | BANK_TRANSFER   |

---

## Homework Assignments (16)

| Title                              | Class    | Section | Teacher          | Due Date     |
|------------------------------------|----------|---------|------------------|--------------|
| Chapter 2 – Place Value Practice   | Grade 1  | A       | `sunita.teacher` | +3 days      |
| Grammar Exercise – Tenses          | Grade 1  | A       | `lakshmi.teacher`| +4 days      |
| Draw Animals Using Shapes          | Grade 1  | B       | `meena.teacher`  | +2 days      |
| Fractions Worksheet                | Grade 3  | A       | `sunita.teacher` | +3 days      |
| Plant Cell Diagram                 | Grade 3  | A       | `vikram.teacher` | +5 days      |
| Essay – My Favourite Season        | Grade 3  | A       | `lakshmi.teacher`| +4 days      |
| Hindi Paragraph Writing            | Grade 3  | B       | `asha.teacher`   | +2 days      |
| Algebraic Expressions Practice     | Grade 5  | A       | `sunita.teacher` | +3 days      |
| Water Cycle Project                | Grade 5  | A       | `vikram.teacher` | +7 days      |
| Medieval India – Summary           | Grade 5  | A       | `rahul.teacher`  | +4 days      |
| Python Turtle Program              | Grade 5  | B       | `deepak.teacher` | +5 days      |
| Optics Problems Set                | Grade 10 | A       | `suresh.teacher` | +3 days      |
| Organic Chemistry Reactions        | Grade 10 | A       | `rahul.teacher`  | +4 days      |
| Trigonometry – Prove 15 Identities | Grade 10 | A       | `sunita.teacher` | +5 days      |
| Database Design Assignment         | Grade 10 | A       | `deepak.teacher` | +6 days      |
| Photorespiration Essay             | Grade 10 | A       | `vikram.teacher` | +3 days      |

---

## Timetable (65+ slots across 3 grades)

Timetable seeded for **Grade 1-A**, **Grade 5-A**, and **Grade 10-A** covering all 5 weekdays.

| Class    | Section | Day | Time          | Subject             | Teacher          |
|----------|---------|-----|---------------|---------------------|------------------|
| Grade 1  | A       | Mon | 07:30 – 08:30 | Mathematics         | `sunita.teacher` |
| Grade 1  | A       | Mon | 08:30 – 09:30 | English             | `lakshmi.teacher`|
| Grade 1  | A       | Mon | 09:45 – 10:45 | Hindi               | `asha.teacher`   |
| Grade 1  | A       | Mon | 10:45 – 11:45 | Science             | `vikram.teacher` |
| Grade 1  | A       | Mon | 12:30 – 13:30 | Art & Craft         | `meena.teacher`  |
| Grade 1  | A       | Mon | 13:30 – 14:30 | Physical Education  | `arjun.teacher`  |
| Grade 10 | A       | Mon | 07:30 – 08:30 | Mathematics         | `sunita.teacher` |
| Grade 10 | A       | Mon | 08:30 – 09:30 | Physics             | `suresh.teacher` |
| Grade 10 | A       | Mon | 09:45 – 10:45 | Chemistry           | `rahul.teacher`  |
| Grade 10 | A       | Mon | 10:45 – 11:45 | Biology             | `vikram.teacher` |
| …        | …       | … | …             | …                   | …                |

---

## Attendance

30 school days recorded (weekdays only, going back from today) for **15 students** across Grades 1, 3, 5, 7, 9, and 10.

Attendance pattern per student:
```
PRESENT, PRESENT, PRESENT, PRESENT, LATE,
PRESENT, PRESENT, ABSENT,  PRESENT, PRESENT  (repeating cycle)
```

---

## Website / CMS Data (Public Schema)

### Website Config
| Property          | Value                                             |
|-------------------|---------------------------------------------------|
| Tenant ID         | `sunrise-academy`                                 |
| Tagline           | "Enlightening Minds, Building Futures"            |
| Email             | info@sunriseacademy.edu.in                        |
| Phone             | +91 98765 43210                                   |
| Address           | 12, Knowledge Park, Sector 18, Noida, UP – 201301 |
| Admissions Open   | Yes                                               |
| Theme Color       | `#2563EB`                                         |

### Website Sections (6)
`hero` · `about` · `features` · `faculty` · `achievements` · `contact`

### Gallery Items (8)
Annual Science Exhibition, Cricket Championship, Board Felicitation, Annual Day Dance,
Robotics Workshop, Library Reading Programme, Art Exhibition, Smart Classroom Inauguration.

---

## Admission Leads (12)

| Parent Name     | Student Name    | Applying Class | Status    |
|-----------------|-----------------|----------------|-----------|
| Anil Kapoor     | Ravi Kapoor     | Grade 3        | NEW       |
| Sunita Verma    | Priti Verma     | Grade 1        | CONTACTED |
| Mohan Das       | Arjun Das       | Grade 6        | NEW       |
| Lakshmi Nair    | Meera Nair      | Grade 2        | VISITED   |
| Prasad Reddy    | Vignesh Reddy   | Grade 9        | NEW       |
| Kiran Sharma    | Nisha Sharma    | Grade 4        | CONTACTED |
| Deepa Iyer      | Gautam Iyer     | Grade 7        | VISITED   |
| Rajiv Khanna    | Aakash Khanna   | Grade 1        | ADMITTED  |
| Preethi Menon   | Divya Menon     | Grade 5        | NEW       |
| Sachin Gupta    | Ronak Gupta     | Grade 8        | CONTACTED |
| Ananya Pillai   | Tara Pillai     | Grade 3        | VISITED   |
| Vijay Mishra    | Shrey Mishra    | Grade 10       | NEW       |

---

## Quick Login Reference

| Who               | Username              | Password     | tenantSlug        |
|-------------------|-----------------------|--------------|-------------------|
| Platform Admin    | `<env var>`           | `<env var>`  | *(not needed)*    |
| School Admin      | `priya.schooladmin`   | `Demo@2026!` | `sunrise-academy` |
| Teacher           | `sunita.teacher`      | `Demo@2026!` | `sunrise-academy` |
| Teacher           | `vikram.teacher`      | `Demo@2026!` | `sunrise-academy` |
| Teacher           | `deepak.teacher`      | `Demo@2026!` | `sunrise-academy` |
| Teacher           | `suresh.teacher`      | `Demo@2026!` | `sunrise-academy` |
| Student           | `aarav.student`       | `Demo@2026!` | `sunrise-academy` |
| Student           | `siddharth.student`   | `Demo@2026!` | `sunrise-academy` |
| Parent            | `ramesh.parent`       | `Demo@2026!` | `sunrise-academy` |
| Parent            | `mukesh.parent`       | `Demo@2026!` | `sunrise-academy` |
