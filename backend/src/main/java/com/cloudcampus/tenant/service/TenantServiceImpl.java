package com.cloudcampus.tenant.service;

import com.cloudcampus.tenant.dto.TenantCreateRequest;
import com.cloudcampus.tenant.dto.SchoolSearchResponse;
import com.cloudcampus.tenant.dto.TenantResponse;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.mapper.TenantMapper;
import com.cloudcampus.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final JdbcTemplate jdbcTemplate;
    private final TenantMapper tenantMapper;

    @Override
    @Transactional
    public TenantResponse createTenant(TenantCreateRequest request) {
        String tenantId = normalize(request.tenantId());
        String slug = resolveSlug(request.slug(), request.schoolName(), tenantId);
        String schemaName = resolveSchemaName(tenantId, request.schemaName());

        if (tenantRepository.existsByTenantId(tenantId)) {
            throw new IllegalArgumentException("Tenant already exists: " + tenantId);
        }
        if (tenantRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("School slug already exists: " + slug);
        }
        if (tenantRepository.existsBySchemaName(schemaName)) {
            throw new IllegalArgumentException("Schema already registered: " + schemaName);
        }

        createSchemaIfNotExists(schemaName);

        Tenant tenant = new Tenant();
        tenant.setTenantId(tenantId);
    tenant.setSlug(slug);
        tenant.setSchoolName(request.schoolName().trim());
        tenant.setSchemaName(schemaName);
        tenant.setLogoUrl(normalizeNullable(request.logoUrl()));
        tenant.setPrimaryColor(request.primaryColor().trim());
        tenant.setActive(true);

        Tenant saved = tenantRepository.save(tenant);
        log.info("Tenant created: tenantId={}, slug={}, schema={}", saved.getTenantId(), saved.getSlug(), saved.getSchemaName());
        return map(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAll().stream().map(this::map).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SchoolSearchResponse> searchSchools(String query) {
        if (!StringUtils.hasText(query)) {
            return List.of();
        }

        return tenantRepository.searchActiveSchools(query.trim()).stream()
                .limit(8)
            .map(tenantMapper::toSchoolSearch)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SchoolSearchResponse getSchoolBySlug(String tenantSlug) {
        Tenant tenant = tenantRepository.findBySlug(normalizeSlug(tenantSlug))
                .filter(Tenant::isActive)
                .orElseThrow(() -> new IllegalArgumentException("School not found: " + tenantSlug));
        return tenantMapper.toSchoolSearch(tenant);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantByTenantId(String tenantId) {
        Tenant tenant = tenantRepository.findByTenantId(normalize(tenantId))
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));
        return map(tenant);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantBySlug(String tenantSlug) {
        Tenant tenant = tenantRepository.findBySlug(normalizeSlug(tenantSlug))
                .filter(Tenant::isActive)
                .orElseThrow(() -> new IllegalArgumentException("School not found: " + tenantSlug));
        return map(tenant);
    }

    @Override
    @Transactional(readOnly = true)
    public String resolveSchemaByTenantIdentifier(String identifier) {
        String normalized = normalize(identifier);

        return tenantRepository.findBySchemaName(normalized)
                .or(() -> tenantRepository.findBySlug(normalized))
                .or(() -> tenantRepository.findByTenantId(normalized))
                .filter(Tenant::isActive)
                .map(Tenant::getSchemaName)
                .orElseThrow(() -> new IllegalArgumentException("School not found: " + identifier));
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getCurrentTenant() {
        String schemaName = TenantContext.getTenant();
        validateTenantContext(schemaName);

        Tenant tenant = tenantRepository.findBySchemaName(schemaName)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found for schema: " + schemaName));
        return map(tenant);
    }

    private void createSchemaIfNotExists(String schemaName) {
        String sql = "CREATE SCHEMA IF NOT EXISTS \"" + schemaName + "\"";
        jdbcTemplate.execute(sql);
        initializeTenantTables(schemaName);
        log.info("Schema ensured for tenant: {}", schemaName);
    }

    private void initializeTenantTables(String schemaName) {
        String createUsersTable = """
                CREATE TABLE IF NOT EXISTS "%s".users (
                    id UUID PRIMARY KEY,
                    full_name VARCHAR(120) NOT NULL,
                    username VARCHAR(100) NOT NULL UNIQUE,
                    email VARCHAR(160) NOT NULL UNIQUE,
                    password_hash VARCHAR(200) NOT NULL,
                    role VARCHAR(40) NOT NULL,
                    tenant_id VARCHAR(80),
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ,
                    created_by UUID,
                    updated_by UUID,
                    deleted_at TIMESTAMPTZ
                )
                """.formatted(schemaName);

        String createStudentsTable = """
                CREATE TABLE IF NOT EXISTS "%s".students (
                    id UUID PRIMARY KEY,
                    admission_no VARCHAR(50) NOT NULL UNIQUE,
                    first_name VARCHAR(80) NOT NULL,
                    last_name VARCHAR(80) NOT NULL,
                    date_of_birth DATE NOT NULL,
                    gender VARCHAR(20) NOT NULL,
                    email VARCHAR(160),
                    phone VARCHAR(30),
                    user_id UUID REFERENCES "%s".users(id),
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ,
                    created_by UUID,
                    updated_by UUID,
                    deleted_at TIMESTAMPTZ
                )
                """.formatted(schemaName, schemaName);

        String createTeachersTable = """
                CREATE TABLE IF NOT EXISTS "%s".teachers (
                    id UUID PRIMARY KEY,
                    employee_no VARCHAR(50) NOT NULL UNIQUE,
                    first_name VARCHAR(80) NOT NULL,
                    last_name VARCHAR(80) NOT NULL,
                    email VARCHAR(160) NOT NULL UNIQUE,
                    phone VARCHAR(30),
                    hire_date DATE NOT NULL,
                    user_id UUID REFERENCES "%s".users(id),
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ,
                    created_by UUID,
                    updated_by UUID
                )
                """.formatted(schemaName, schemaName);

        String createClassesTable = """
                CREATE TABLE IF NOT EXISTS "%s".classes (
                    id UUID PRIMARY KEY,
                    name VARCHAR(80) NOT NULL,
                    code VARCHAR(40) NOT NULL UNIQUE,
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL
                )
                """.formatted(schemaName);

        String createSubjectsTable = """
                CREATE TABLE IF NOT EXISTS "%s".subjects (
                    id UUID PRIMARY KEY,
                    name VARCHAR(120) NOT NULL,
                    code VARCHAR(40) NOT NULL UNIQUE,
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL
                )
                """.formatted(schemaName);

        String createSectionsTable = """
                CREATE TABLE IF NOT EXISTS "%s".sections (
                    id UUID PRIMARY KEY,
                    name VARCHAR(80) NOT NULL,
                    class_id UUID NOT NULL REFERENCES "%s".classes(id),
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL
                )
                """.formatted(schemaName, schemaName);

        String createAttendanceTable = """
                CREATE TABLE IF NOT EXISTS "%s".attendance_records (
                    id UUID PRIMARY KEY,
                    student_id UUID NOT NULL REFERENCES "%s".students(id),
                    class_id UUID NOT NULL REFERENCES "%s".classes(id),
                    section_id UUID NOT NULL REFERENCES "%s".sections(id),
                    attendance_date DATE NOT NULL,
                    status VARCHAR(20) NOT NULL,
                    remarks VARCHAR(255),
                    marked_by_user_id UUID NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ,
                    created_by UUID,
                    updated_by UUID,
                    CONSTRAINT uq_attendance_student_date UNIQUE (student_id, attendance_date)
                )
                """.formatted(schemaName, schemaName, schemaName, schemaName);

        String createFeeAssignmentsTable = """
                CREATE TABLE IF NOT EXISTS "%s".fee_assignments (
                    id UUID PRIMARY KEY,
                    student_id UUID NOT NULL REFERENCES "%s".students(id),
                    fee_title VARCHAR(120) NOT NULL,
                    amount NUMERIC(12,2) NOT NULL,
                    due_date DATE NOT NULL,
                    status VARCHAR(20) NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ,
                    created_by UUID,
                    updated_by UUID
                )
                """.formatted(schemaName, schemaName);

        String createFeePaymentsTable = """
                CREATE TABLE IF NOT EXISTS "%s".fee_payments (
                    id UUID PRIMARY KEY,
                    fee_assignment_id UUID NOT NULL REFERENCES "%s".fee_assignments(id),
                    amount_paid NUMERIC(12,2) NOT NULL,
                    payment_date DATE NOT NULL,
                    payment_method VARCHAR(30) NOT NULL,
                    reference_no VARCHAR(80),
                    received_by_user_id UUID NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ,
                    created_by UUID,
                    updated_by UUID
                )
                """.formatted(schemaName, schemaName);

        String createExamsTable = """
                CREATE TABLE IF NOT EXISTS "%s".exams (
                    id UUID PRIMARY KEY,
                    title VARCHAR(120) NOT NULL,
                    exam_date DATE NOT NULL,
                    class_id UUID NOT NULL REFERENCES "%s".classes(id),
                    section_id UUID NOT NULL REFERENCES "%s".sections(id),
                    subject_id UUID NOT NULL REFERENCES "%s".subjects(id),
                    max_marks NUMERIC(6,2) NOT NULL,
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ,
                    created_by UUID,
                    updated_by UUID,
                    CONSTRAINT uq_exam_schedule UNIQUE (title, exam_date, class_id, section_id, subject_id)
                )
                """.formatted(schemaName, schemaName, schemaName, schemaName);

        String createExamResultsTable = """
                CREATE TABLE IF NOT EXISTS "%s".exam_results (
                    id UUID PRIMARY KEY,
                    exam_id UUID NOT NULL REFERENCES "%s".exams(id),
                    student_id UUID NOT NULL REFERENCES "%s".students(id),
                    marks_obtained NUMERIC(6,2) NOT NULL,
                    grade VARCHAR(10),
                    remarks VARCHAR(255),
                    published BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ,
                    created_by UUID,
                    updated_by UUID,
                    CONSTRAINT uq_exam_result_student UNIQUE (exam_id, student_id)
                )
                """.formatted(schemaName, schemaName, schemaName);

        String idxUsername = "CREATE INDEX IF NOT EXISTS idx_users_username ON \"" + schemaName + "\".users (username)";
        String idxEmail = "CREATE INDEX IF NOT EXISTS idx_users_email ON \"" + schemaName + "\".users (email)";
        String idxAdmissionNo = "CREATE INDEX IF NOT EXISTS idx_students_admission_no ON \"" + schemaName + "\".students (admission_no)";
        String idxTeacherEmployeeNo = "CREATE INDEX IF NOT EXISTS idx_teachers_employee_no ON \"" + schemaName + "\".teachers (employee_no)";
        String idxTeacherEmail = "CREATE INDEX IF NOT EXISTS idx_teachers_email ON \"" + schemaName + "\".teachers (email)";
        String idxClassCode = "CREATE INDEX IF NOT EXISTS idx_classes_code ON \"" + schemaName + "\".classes (code)";
        String idxSubjectCode = "CREATE INDEX IF NOT EXISTS idx_subjects_code ON \"" + schemaName + "\".subjects (code)";
        String idxSectionClassId = "CREATE INDEX IF NOT EXISTS idx_sections_class_id ON \"" + schemaName + "\".sections (class_id)";
        String idxAttendanceDate = "CREATE INDEX IF NOT EXISTS idx_attendance_date ON \"" + schemaName + "\".attendance_records (attendance_date)";
        String idxAttendanceStudent = "CREATE INDEX IF NOT EXISTS idx_attendance_student ON \"" + schemaName + "\".attendance_records (student_id)";
        String idxFeeAssignmentStudent = "CREATE INDEX IF NOT EXISTS idx_fee_assignments_student ON \"" + schemaName + "\".fee_assignments (student_id)";
        String idxFeePaymentsAssignment = "CREATE INDEX IF NOT EXISTS idx_fee_payments_assignment ON \"" + schemaName + "\".fee_payments (fee_assignment_id)";
        String idxExamsClass = "CREATE INDEX IF NOT EXISTS idx_exams_class ON \"" + schemaName + "\".exams (class_id)";
        String idxExamsDate = "CREATE INDEX IF NOT EXISTS idx_exams_date ON \"" + schemaName + "\".exams (exam_date)";
        String idxExamResultsExam = "CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON \"" + schemaName + "\".exam_results (exam_id)";
        String idxExamResultsStudent = "CREATE INDEX IF NOT EXISTS idx_exam_results_student ON \"" + schemaName + "\".exam_results (student_id)";

        String createParentStudentsTable = """
                CREATE TABLE IF NOT EXISTS "%s".parent_students (
                    id UUID PRIMARY KEY,
                    parent_user_id UUID NOT NULL REFERENCES "%s".users(id) ON DELETE CASCADE,
                    student_id UUID NOT NULL REFERENCES "%s".students(id) ON DELETE CASCADE,
                    created_at TIMESTAMPTZ NOT NULL,
                    CONSTRAINT uq_parent_student UNIQUE (parent_user_id, student_id)
                )
                """.formatted(schemaName, schemaName, schemaName);

        String createHomeworkTable = """
                CREATE TABLE IF NOT EXISTS "%s".homework_assignments (
                    id UUID PRIMARY KEY,
                    title VARCHAR(200) NOT NULL,
                    instructions TEXT,
                    class_id UUID NOT NULL REFERENCES "%s".classes(id),
                    section_id UUID REFERENCES "%s".sections(id),
                    assigned_by_user_id UUID NOT NULL,
                    due_date DATE,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ,
                    created_by UUID,
                    updated_by UUID
                )
                """.formatted(schemaName, schemaName, schemaName);

        String createTimetableTable = """
                CREATE TABLE IF NOT EXISTS "%s".timetable_slots (
                    id UUID PRIMARY KEY,
                    class_id UUID NOT NULL REFERENCES "%s".classes(id),
                    section_id UUID NOT NULL REFERENCES "%s".sections(id),
                    subject_id UUID NOT NULL REFERENCES "%s".subjects(id),
                    teacher_id UUID REFERENCES "%s".teachers(id),
                    day_of_week SMALLINT NOT NULL,
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL,
                    label VARCHAR(80),
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ,
                    created_by UUID,
                    updated_by UUID
                )
                """.formatted(schemaName, schemaName, schemaName, schemaName, schemaName);

        String alterUsersTenantId = "ALTER TABLE \"" + schemaName + "\".users ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(80)";
        String alterStudentsUserId = "ALTER TABLE \"" + schemaName + "\".students ADD COLUMN IF NOT EXISTS user_id UUID";
        String alterTeachersUserId = "ALTER TABLE \"" + schemaName + "\".teachers ADD COLUMN IF NOT EXISTS user_id UUID";

        jdbcTemplate.execute(createUsersTable);
        jdbcTemplate.execute(createStudentsTable);
        jdbcTemplate.execute(createTeachersTable);
        jdbcTemplate.execute(createClassesTable);
        jdbcTemplate.execute(createSubjectsTable);
        jdbcTemplate.execute(createSectionsTable);
        jdbcTemplate.execute(createAttendanceTable);
        jdbcTemplate.execute(createFeeAssignmentsTable);
        jdbcTemplate.execute(createFeePaymentsTable);
        jdbcTemplate.execute(createExamsTable);
        jdbcTemplate.execute(createExamResultsTable);
        jdbcTemplate.execute(alterUsersTenantId);
        jdbcTemplate.execute(alterStudentsUserId);
        jdbcTemplate.execute(alterTeachersUserId);
        jdbcTemplate.execute(createParentStudentsTable);
        jdbcTemplate.execute(createHomeworkTable);
        jdbcTemplate.execute(createTimetableTable);

        // Add audit columns to all tables for existing tenants (safe no-op when columns already present)
        String[] auditTables = {"users", "students", "teachers", "attendance_records", "fee_assignments",
                "fee_payments", "exams", "exam_results", "homework_assignments", "timetable_slots"};
        for (String table : auditTables) {
            jdbcTemplate.execute("ALTER TABLE \"" + schemaName + "\".\"" + table + "\" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ");
            jdbcTemplate.execute("ALTER TABLE \"" + schemaName + "\".\"" + table + "\" ADD COLUMN IF NOT EXISTS created_by UUID");
            jdbcTemplate.execute("ALTER TABLE \"" + schemaName + "\".\"" + table + "\" ADD COLUMN IF NOT EXISTS updated_by UUID");
        }

        // Add soft-delete column for users, students, teachers
        String[] softDeleteTables = {"users", "students", "teachers"};
        for (String table : softDeleteTables) {
            jdbcTemplate.execute("ALTER TABLE \"" + schemaName + "\".\"" + table + "\" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ");
        }

        jdbcTemplate.execute(idxUsername);
        jdbcTemplate.execute(idxEmail);
        jdbcTemplate.execute(idxAdmissionNo);
        jdbcTemplate.execute(idxTeacherEmployeeNo);
        jdbcTemplate.execute(idxTeacherEmail);
        jdbcTemplate.execute(idxClassCode);
        jdbcTemplate.execute(idxSubjectCode);
        jdbcTemplate.execute(idxSectionClassId);
        jdbcTemplate.execute(idxAttendanceDate);
        jdbcTemplate.execute(idxAttendanceStudent);
        jdbcTemplate.execute(idxFeeAssignmentStudent);
        jdbcTemplate.execute(idxFeePaymentsAssignment);
        jdbcTemplate.execute(idxExamsClass);
        jdbcTemplate.execute(idxExamsDate);
        jdbcTemplate.execute(idxExamResultsExam);
        jdbcTemplate.execute(idxExamResultsStudent);
    }

    private String resolveSchemaName(String tenantId, String schemaName) {
        if (schemaName == null || schemaName.isBlank()) {
            return "school_" + tenantId;
        }
        return normalizeSchema(schemaName);
    }

    private String normalize(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeSlug(String value) {
        String normalized = Normalizer.normalize(value.trim().toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "")
                .replaceAll("-{2,}", "-");

        if (!StringUtils.hasText(normalized)) {
            throw new IllegalArgumentException("slug could not be generated");
        }

        return normalized;
    }

    private String normalizeSchema(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String resolveSlug(String requestedSlug, String schoolName, String tenantId) {
        if (StringUtils.hasText(requestedSlug)) {
            return normalizeSlug(requestedSlug);
        }

        if (StringUtils.hasText(schoolName)) {
            return normalizeSlug(schoolName);
        }

        return normalizeSlug(tenantId);
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void validateTenantContext(String schemaName) {
        if (schemaName == null || TenantContext.DEFAULT_SCHEMA.equals(schemaName)) {
            throw new IllegalArgumentException("X-Tenant-Slug header is required for tenant operations");
        }
    }

    private TenantResponse map(Tenant tenant) {
        return tenantMapper.toResponse(tenant);
    }

}
