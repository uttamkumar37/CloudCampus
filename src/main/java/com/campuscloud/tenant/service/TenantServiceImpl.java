package com.campuscloud.tenant.service;

import com.campuscloud.tenant.dto.TenantCreateRequest;
import com.campuscloud.tenant.dto.TenantResponse;
import com.campuscloud.tenant.entity.Tenant;
import com.campuscloud.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public TenantResponse createTenant(TenantCreateRequest request) {
        String tenantId = normalize(request.tenantId());
        String schemaName = resolveSchemaName(tenantId, request.schemaName());

        if (tenantRepository.existsByTenantId(tenantId)) {
            throw new IllegalArgumentException("Tenant already exists: " + tenantId);
        }
        if (tenantRepository.existsBySchemaName(schemaName)) {
            throw new IllegalArgumentException("Schema already registered: " + schemaName);
        }

        createSchemaIfNotExists(schemaName);

        Tenant tenant = new Tenant();
        tenant.setTenantId(tenantId);
        tenant.setSchoolName(request.schoolName().trim());
        tenant.setSchemaName(schemaName);
        tenant.setActive(true);

        Tenant saved = tenantRepository.save(tenant);
        log.info("Tenant created: tenantId={}, schema={}", saved.getTenantId(), saved.getSchemaName());
        return map(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAll().stream().map(this::map).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantByTenantId(String tenantId) {
        Tenant tenant = tenantRepository.findByTenantId(normalize(tenantId))
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));
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
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL
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
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL
                )
                """.formatted(schemaName);

        String createTeachersTable = """
                CREATE TABLE IF NOT EXISTS "%s".teachers (
                    id UUID PRIMARY KEY,
                    employee_no VARCHAR(50) NOT NULL UNIQUE,
                    first_name VARCHAR(80) NOT NULL,
                    last_name VARCHAR(80) NOT NULL,
                    email VARCHAR(160) NOT NULL UNIQUE,
                    phone VARCHAR(30),
                    hire_date DATE NOT NULL,
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL
                )
                """.formatted(schemaName);

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
                    created_at TIMESTAMPTZ NOT NULL
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
                    created_at TIMESTAMPTZ NOT NULL
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

    private String normalizeSchema(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private TenantResponse map(Tenant tenant) {
        return new TenantResponse(
                tenant.getId(),
                tenant.getTenantId(),
                tenant.getSchoolName(),
                tenant.getSchemaName(),
                tenant.isActive(),
                tenant.getCreatedAt()
        );
    }
}
