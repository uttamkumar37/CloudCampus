package com.cloudcampus.exam.repository;

import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.entity.ExamStatus;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@Transactional
@DisplayName("ExamResultRepository parent visibility")
class ExamResultRepositoryTest {

    @Container
    @ServiceConnection
    @SuppressWarnings("resource")
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("pgvector/pgvector:pg16");

    @Container
    @ServiceConnection
    @SuppressWarnings("resource")
    static final GenericContainer<?> REDIS =
            new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    @Autowired private ExamResultRepository resultRepo;
    @Autowired private JdbcTemplate jdbc;

    private UUID tenantId;
    private UUID schoolId;
    private UUID studentId;
    private UUID completedExamId;
    private UUID draftExamId;

    @BeforeEach
    void setUp() {
        RequestContext.clearAll();

        tenantId = UUID.randomUUID();
        schoolId = UUID.randomUUID();
        studentId = UUID.randomUUID();
        UUID academicYearId = UUID.randomUUID();
        completedExamId = UUID.randomUUID();
        draftExamId = UUID.randomUUID();

        RequestContext.setTenantId(tenantId.toString());

        jdbc.update("INSERT INTO tenants (id, code, name, status, created_at) VALUES (?, ?, ?, 'ACTIVE', now())",
                tenantId, "tenant-" + tenantId.toString().substring(0, 8), "Repository Visibility Tenant");
        jdbc.update("""
                INSERT INTO schools (id, tenant_id, name, code, status, created_at, updated_at)
                VALUES (?, ?, 'Repository Visibility School', 'MAIN', 'ACTIVE', now(), now())
                """, schoolId, tenantId);
        jdbc.update("""
                INSERT INTO academic_years (id, tenant_id, school_id, name,
                                            start_date, end_date, is_current, status,
                                            created_at, updated_at)
                VALUES (?, ?, ?, '2025-26', '2025-04-01', '2026-03-31',
                        true, 'ACTIVE', now(), now())
                """, academicYearId, tenantId, schoolId);
        jdbc.update("""
                INSERT INTO students (id, tenant_id, school_id, student_number,
                                      status, first_name, last_name,
                                      admission_date, created_at, updated_at)
                VALUES (?, ?, ?, 'STU-PUB-001', 'ACTIVE', 'Parent', 'Visible',
                        current_date, now(), now())
                """, studentId, tenantId, schoolId);
        insertExam(completedExamId, academicYearId, "Completed Exam", "COMPLETED");
        insertExam(draftExamId, academicYearId, "Draft Exam", "DRAFT");
        insertResult(completedExamId, "A", 88);
        insertResult(draftExamId, "B", 72);
    }

    @AfterEach
    void tearDown() {
        RequestContext.clearAll();
    }

    @Test
    @DisplayName("parent-visible query returns completed results and excludes draft results")
    void findByStudentIdAndSchoolIdAndExamStatusOrderByCreatedAtDesc_excludesDraftResults() {
        List<ExamResult> results =
                resultRepo.findByStudentIdAndSchoolIdAndExamStatusOrderByCreatedAtDesc(
                        studentId, schoolId, ExamStatus.COMPLETED);

        assertThat(results)
                .extracting(ExamResult::getExamId)
                .containsExactly(completedExamId);
        assertThat(results)
                .extracting(ExamResult::getExamId)
                .doesNotContain(draftExamId);
    }

    private void insertExam(UUID examId, UUID academicYearId, String name, String status) {
        jdbc.update("""
                INSERT INTO exams (id, tenant_id, school_id, academic_year_id,
                                   name, exam_type, status,
                                   start_date, end_date, total_marks, passing_marks,
                                   created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 'UNIT_TEST', ?,
                        '2025-05-01', '2025-05-02', 100.00, 35.00,
                        now(), now())
                """, examId, tenantId, schoolId, academicYearId, name, status);
    }

    private void insertResult(UUID examId, String grade, int percentage) {
        jdbc.update("""
                INSERT INTO exam_results (id, tenant_id, exam_id, student_id, school_id,
                                          total_marks_obtained, total_marks_possible,
                                          percentage, grade, rank, is_passed,
                                          generated_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 100.00, ?, ?, 1, true, now(), now(), now())
                """, UUID.randomUUID(), tenantId, examId, studentId, schoolId,
                percentage, percentage, grade);
    }
}
