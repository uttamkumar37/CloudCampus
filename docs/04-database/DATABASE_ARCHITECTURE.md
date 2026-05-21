# Database Architecture

CloudCampus uses PostgreSQL 16 with Flyway migrations and pgvector support.

## Migration Range
- First migration: `V10__create_device_tokens.sql`.
- Latest migration: `V9__soft_delete.sql`.
- Total migrations detected: 93.

## Major Table Families From Migrations
- Tenants, users, schools, academic years, classes, sections, subjects, departments, settings.
- Students, student-parent links, documents, Profile 360 tables.
- Attendance sessions/records and staff attendance.
- Fee categories, structures, student fee records, payments, payment orders, receipts.
- Notifications, WhatsApp message logs, device tokens, device sessions.
- Exams, exam subjects, marks, results.
- Homework, assignments, timetable, notices, leave, lesson plans, online classes, videos.
- Tenant subscriptions, feature flags, tenant configs.
- AI prompt, knowledge, embeddings/vector support, usage logs.
- Website builder, custom domains, public website/experience platform, investor rooms, analytics events.
- Audit logs, upload audit, website audit timeline, rollback audit, investor room access log.
