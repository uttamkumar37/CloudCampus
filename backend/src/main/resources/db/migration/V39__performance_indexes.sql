-- V39: Targeted performance indexes for report queries and notice board (CC-1701).
--
-- Rationale per index:
--
--   1. attendance_sessions(school_id, academic_year_id)
--      Every report query starts with findSessionIdsBySchoolAndYear which filters
--      by BOTH columns. The existing idx_att_session_school_date and
--      idx_att_session_acad_year each carry a trailing session_date column that
--      does not appear in this filter, forcing either a partial index scan or a
--      bitmap-AND of two indexes. This dedicated composite eliminates that overhead.
--
--   2. attendance_records(session_id, status)
--      The new countByStatusForSessions aggregate (GROUP BY status WHERE session_id IN ...)
--      and the existing aggregateByStudentAndStatus (GROUP BY student_id, status WHERE
--      session_id IN ...) both filter on session_id and read status. Including status
--      in the index allows index-only reads of the aggregate columns without a heap fetch
--      (once the visibility map is populated after VACUUM).
--
--   3. exam_results(school_id, exam_id, rank ASC NULLS LAST)
--      findBySchoolIdAndExamIdOrderByRankAsc filters by school_id AND exam_id and
--      immediately sorts by rank. The existing idx_exam_results_rank covers (exam_id,
--      rank) but lacks school_id as a leading prefix — PostgreSQL must re-filter on
--      school_id after scanning by exam_id. This composite index serves as a covering
--      index for the query's WHERE + ORDER BY in one scan.
--
--   4. school_notices(school_id, is_published, priority DESC, created_at DESC)
--      findFiltered and findPublishedForTarget both filter by school_id + is_published
--      and ORDER BY priority DESC, created_at DESC. The current idx_notices_school_pub
--      covers the WHERE columns but not the sort, causing PostgreSQL to do an in-memory
--      sort after the index scan. This extended index allows sort-avoiding index scans
--      for the common paginated notice listing path.
--
--   5. school_notices(school_id, target, is_published)
--      findPublishedForTarget also filters by target (STUDENTS / TEACHERS / PARENTS /
--      ALL). Adding target to a separate partial index on (is_published = true) pages
--      allow efficient lookup by target audience without a full school scan.

-- ── 1. Attendance sessions: report hot-path ──────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_att_session_school_year
    ON attendance_sessions(school_id, academic_year_id);

-- ── 2. Attendance records: aggregate covering index ───────────────────────────

CREATE INDEX IF NOT EXISTS idx_att_record_session_status
    ON attendance_records(session_id, status);

-- ── 3. Exam results: performance report covering index ────────────────────────

CREATE INDEX IF NOT EXISTS idx_exam_results_school_exam_rank
    ON exam_results(school_id, exam_id, rank ASC NULLS LAST);

-- ── 4. School notices: sort-avoiding index for paginated listing ──────────────

CREATE INDEX IF NOT EXISTS idx_notices_school_pub_sort
    ON school_notices(school_id, is_published, priority DESC, created_at DESC);

-- ── 5. School notices: target-audience filter ─────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_notices_school_target
    ON school_notices(school_id, target, is_published);
