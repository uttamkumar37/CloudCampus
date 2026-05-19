# Database Index Audit

Last updated: 2026-05-19

## Scope

This audit maps high-traffic query paths to current Flyway index coverage and tracks index gaps that should be validated with production-like `EXPLAIN (ANALYZE, BUFFERS)` output before adding forward-only migrations.

TASK-029 is documentation-only. It does not add or alter indexes because index creation needs staging cardinality checks, lock/concurrency review, and a forward-only Flyway migration.

## Existing Coverage

| Area | Heavy query path | Current coverage | Status |
|---|---|---|---|
| Users and auth | Tenant/role/status/username lookups, login lookup by username, device token/session lookup | `idx_users_tenant_role`, `idx_users_tenant_status`, `idx_users_tenant_username`, `idx_users_username`, `uidx_device_tokens_user_token`, `idx_device_tokens_tenant_user`, `idx_device_sessions_user`, `idx_device_sessions_tenant` | Covered for tenant-scoped auth paths. |
| Schools and tenant setup | Active school counts and tenant school lookup | `idx_schools_tenant_active`, `idx_schools_status`, `idx_schools_tenant_id`, `idx_tenants_status`, `idx_tenant_configs_tenant_id` | Covered for dashboard and usage-limit checks. |
| Students | School/class/section rosters, active counts, student number lookup, basic name order | `idx_students_school`, `idx_students_class`, `idx_students_section`, `idx_students_status`, `idx_students_number`, `idx_students_name` | Covered for common filters; name search needs EXPLAIN tracking. |
| Staff | School/department/status/type rosters, employee number lookup, basic name order | `idx_staff_school`, `idx_staff_department`, `idx_staff_status`, `idx_staff_type`, `idx_staff_emp_number`, `idx_staff_name` | Covered for common filters; lower-case prefix search needs EXPLAIN tracking. |
| Attendance sessions | School/date lists, class/date range, school/year report session ids, duplicate guards | `idx_att_session_school_date`, `idx_att_session_class_date`, `idx_att_session_section_date`, `idx_att_session_acad_year`, `idx_att_session_school_year`, `uidx_att_session_section`, `uidx_att_session_class_only` | Covered, including a dedicated report index from `V39__performance_indexes.sql`. |
| Attendance records | Session load, session/status aggregates, student history joins | `idx_att_record_session`, `idx_att_record_student`, `idx_att_record_status`, `idx_att_record_tenant`, `idx_att_record_session_status` | Covered for session aggregates; student/date join remains a tracked gap. |
| Fees and payments | Student invoices, school/year ledgers, status filters, fee payment history | `idx_sfr_student`, `idx_sfr_school_year`, `idx_sfr_status`, `idx_sfr_tenant`, `idx_fee_payments_record`, `idx_fee_payments_date`, `idx_payment_orders_fee_record`, `idx_payment_orders_tenant`, `idx_payment_orders_student` | Covered for current ledgers; reminder due-date scan remains a tracked gap. |
| Exams and results | Exam lists by school/year/status, ranked result reports, marks by exam/student | `idx_exams_tenant`, `idx_exams_school`, `idx_exams_academic_year`, `idx_exams_start_date`, `idx_exams_status`, `idx_exam_results_school_exam_rank`, `idx_student_marks_exam`, `idx_student_marks_exam_subject`, `idx_student_marks_student` | Covered for ranked performance reports. |
| Notices | Admin filtered notices and public target notices ordered by priority/date | `idx_notices_school_pub_sort`, `idx_notices_school_target`, `idx_notices_expires`, `idx_notices_active` | Covered by the targeted `V39__performance_indexes.sql` indexes. |
| Homework and assignments | Teacher lists, class published lists, assignment/submission counts | `idx_homework_school_year`, `idx_homework_class_sec`, `idx_homework_due_date`, `idx_homework_assigned_by`, `idx_homework_assignments_active`, `idx_assignments_school_year`, `idx_assignments_class_sec`, `idx_submissions_assignment`, `idx_submissions_student` | Partially covered; filter-plus-sort composites are tracked. |
| Timetable | Class grid lookup, section conflict check, teacher conflict check | `idx_timetable_school_year`, `idx_timetable_class_sec`, `idx_timetable_staff_day`, unique section-period constraint | Partially covered; teacher conflict composite is tracked. |
| Tenant website builder | School pages, published pages, page sections, navigation | `idx_websites_tenant`, `idx_website_pages_school`, `idx_website_sections_page`, `idx_nav_items_school`, unique `(school_id, slug)` | Partially covered; published page ordering composite is tracked. |
| Platform public website | Published slug/page reads, page sections, navigation, SEO route reads | `idx_pwp_slug_published`, `idx_pws_page_position`, `idx_pwn_group_position`, `idx_pwseo_route_published`, unique slugs/routes | Covered for point reads; published/deleted list ordering is tracked. |
| Platform experience analytics | Event counts by type/date, visitor/session activity, top pages | `idx_pee_session`, `idx_pee_visitor`, `idx_pee_tenant`, `idx_pee_created`, `idx_pee_type` | Covered for date/type filters; page-path aggregate is tracked. |
| AI usage and RAG | Monthly token totals, tenant budget checks, grouped feature/model analytics, vector similarity search | `idx_ai_usage_tenant`, `idx_ai_usage_created`, `idx_ai_usage_school`, HNSW vector index, `idx_vector_metadata`, `idx_knowledge_tenant`, `idx_knowledge_created` | Partially covered; high-cardinality monthly aggregates are tracked. |
| Audit trails | Tenant audit log, upload audit, website audit timeline, investor room access log | `idx_audit_log_tenant_created`, `idx_audit_log_tenant_category_created`, `idx_audit_log_tenant_event_created`, `idx_upload_audit_tenant_occurred`, `idx_upload_audit_document`, `idx_pwat_created_at`, `idx_pwat_resource`, `idx_investor_access_room_occurred`, `idx_investor_access_occurred` | Covered for newest-first audit review and resource drill-downs. |

## Tracked Missing Indexes

These are candidates only. Add them through new Flyway migrations after staging `EXPLAIN` confirms they improve the target query without excessive write amplification.

| Priority | Candidate index | Query path | Why it is tracked |
|---|---|---|---|
| HIGH | `CREATE INDEX CONCURRENTLY idx_ai_usage_tenant_created_success ON ai_usage_logs (tenant_id, created_at DESC, success);` | `AiUsageLogRepository.sumTokensByTenantSince`, `countRequestsByTenantSince`, `countFailedRequestsByTenantSince`, budget metrics publisher | Current separate `tenant_id` and `created_at` indexes may bitmap-combine on large monthly log windows; budget checks are frequent and tenant-scoped. |
| HIGH | `CREATE INDEX CONCURRENTLY idx_ai_usage_created_prompt ON ai_usage_logs (created_at DESC, prompt_key);` | `groupedByFeatureSince` | Feature breakdown filters by month and groups by `prompt_key`; current `created_at` index does not cover grouping. |
| HIGH | `CREATE INDEX CONCURRENTLY idx_ai_usage_created_provider_model ON ai_usage_logs (created_at DESC, provider, model);` | `groupedByModelSince` | Model breakdown filters by month and groups by provider/model; needed if AI usage grows quickly. |
| HIGH | `CREATE INDEX CONCURRENTLY idx_sfr_status_due_date ON student_fee_records (status, due_date);` | `FeeReminderScheduler.findByStatusInAndDueDateBetween` | Reminder scheduler scans actionable statuses by due-date range; existing status-only index may still fetch many old rows. |
| MEDIUM | `CREATE INDEX CONCURRENTLY idx_timetable_teacher_conflict ON timetable_slots (school_id, academic_year_id, staff_id, day_of_week, period_number);` | `TimetableRepository.findTeacherConflict` | Existing `idx_timetable_staff_day` lacks school/year/period in the index prefix. |
| MEDIUM | `CREATE INDEX CONCURRENTLY idx_homework_school_status_due ON homework_assignments (school_id, status, due_date ASC, created_at DESC);` | `HomeworkRepository.findFiltered`, `findPublishedForClass` | Current separate school/year, class/section, and due-date indexes may require sort work for paginated homework lists. |
| MEDIUM | `CREATE INDEX CONCURRENTLY idx_website_pages_school_pub_order ON website_pages (school_id, published, display_order);` | `WebsitePageRepository.findBySchoolIdAndPublishedTrueOrderByDisplayOrderAsc` | Current `(school_id, published)` index filters but does not guarantee display order. |
| MEDIUM | `CREATE INDEX CONCURRENTLY idx_pwp_published_deleted_updated ON platform_website_pages (published, is_deleted, updated_at DESC);` | `ExperienceWebsitePageRepository.findByDeletedFalseAndPublishedTrueOrderByUpdatedAtDesc` | Public website list reads sort by update time after filtering published/deleted state. |
| MEDIUM | `CREATE INDEX CONCURRENTLY idx_pee_created_page_path ON platform_experience_events (created_at DESC, page_path);` | `ExperienceEventRepository.topPages` | Top pages groups by `page_path` inside a time window; existing created/type indexes do not cover the grouping key. |
| MEDIUM | `CREATE INDEX CONCURRENTLY idx_att_record_student_session ON attendance_records (student_id, session_id);` | Student attendance history joined to sessions by date | Existing student and session indexes are separate; validate whether the planner benefits for long student histories. |
| LOW | Functional lower-prefix indexes on `students` and `staff`, for example `(school_id, lower(first_name) text_pattern_ops)` and `(school_id, lower(last_name) text_pattern_ops)` | `StudentRepository.searchByName`, `StaffRepository.searchByName` | Existing plain name indexes do not directly match `LOWER(name) LIKE lower(:q || '%')`. Add only if search latency appears in staging. |

## EXPLAIN Workflow

Run each candidate against seeded staging with realistic tenant sizes before migration:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT COALESCE(SUM(input_tokens + output_tokens), 0)
FROM ai_usage_logs
WHERE tenant_id = '<tenant-id>'
  AND success = true
  AND created_at >= date_trunc('month', now());
```

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT COALESCE(prompt_key, 'unknown'), SUM(input_tokens + output_tokens), COUNT(*)
FROM ai_usage_logs
WHERE created_at >= date_trunc('month', now())
GROUP BY COALESCE(prompt_key, 'unknown')
ORDER BY SUM(input_tokens + output_tokens) DESC;
```

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM student_fee_records
WHERE status IN ('PENDING', 'PARTIAL', 'OVERDUE')
  AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days';
```

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM website_pages
WHERE school_id = '<school-id>' AND published = true
ORDER BY display_order ASC;
```

## Migration Rules

1. Use a new forward-only Flyway migration for every accepted index.
2. Prefer `CREATE INDEX CONCURRENTLY` for large existing tables, with the migration runner reviewed for PostgreSQL transactional compatibility before rollout.
3. Capture before/after `EXPLAIN (ANALYZE, BUFFERS)` output in the release ticket.
4. Avoid adding overlapping indexes when an existing index can be extended or replaced safely in a later maintenance window.
5. Validate write-heavy tables (`ai_usage_logs`, `platform_experience_events`, audit logs) for insert overhead before accepting new composites.
6. After deployment, monitor slow queries, index usage, table/index bloat, and autovacuum lag.

## Validation

TASK-029 validation command:

```bash
rg -n "CREATE INDEX|EXPLAIN|idx_" backend/src/main/resources/db/migration docs
```
