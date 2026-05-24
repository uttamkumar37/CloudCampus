package com.cloudcampus.student.service;

import com.cloudcampus.audit.service.AuditLogService;
import com.cloudcampus.common.usage.UsageLimitEnforcer;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.student.dto.PromotionResult;
import com.cloudcampus.student.dto.StudentPromotionRequest;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.entity.StudentStatus;
import com.cloudcampus.student.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentServiceImplTest {

    @Mock StudentRepository repo;
    @Mock BulkStudentImporter bulkImporter;
    @Mock UsageLimitEnforcer limitEnforcer;
    @Mock AuditLogService auditLog;

    StudentServiceImpl service;

    static final UUID TENANT_ID = UUID.randomUUID();
    static final UUID USER_ID = UUID.randomUUID();
    static final UUID SCHOOL_ID = UUID.randomUUID();
    static final UUID SOURCE_CLASS_ID = UUID.randomUUID();
    static final UUID SOURCE_SECTION_ID = UUID.randomUUID();
    static final UUID TARGET_CLASS_ID = UUID.randomUUID();
    static final UUID TARGET_SECTION_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new StudentServiceImpl(repo, bulkImporter, limitEnforcer, auditLog);
    }

    @Test
    void promoteStudents_whenDryRun_returnsPreviewWithoutSavingOrAuditing() {
        Student student = activeStudent("S-001");
        StudentPromotionRequest request = promotionRequest(SOURCE_SECTION_ID);
        when(repo.findAllBySchoolIdAndClassIdAndSectionIdAndStatusOrderByLastNameAscFirstNameAsc(
                SCHOOL_ID, SOURCE_CLASS_ID, SOURCE_SECTION_ID, StudentStatus.ACTIVE))
                .thenReturn(List.of(student));

        try (MockedStatic<RequestContext> ctx = requestContext()) {
            PromotionResult result = service.promoteStudents(SCHOOL_ID, request, true);

            assertThat(result.dryRun()).isTrue();
            assertThat(result.studentsFound()).isEqualTo(1);
            assertThat(result.studentsPromoted()).isZero();
            assertThat(result.targetClassId()).isEqualTo(TARGET_CLASS_ID);
            assertThat(student.getClassId()).isEqualTo(SOURCE_CLASS_ID);
            assertThat(student.getSectionId()).isEqualTo(SOURCE_SECTION_ID);
            verify(repo, never()).saveAll(any());
            verify(auditLog, never()).logCriticalMutation(any(), any(), any(), any(), any(), any(), any());
        }
    }

    @Test
    void promoteStudents_whenNotDryRun_updatesStudentsAndWritesAuditLog() {
        Student student = activeStudent("S-002");
        StudentPromotionRequest request = promotionRequest(null);
        when(repo.findAllBySchoolIdAndClassIdAndStatusOrderByLastNameAscFirstNameAsc(
                SCHOOL_ID, SOURCE_CLASS_ID, StudentStatus.ACTIVE))
                .thenReturn(List.of(student));

        try (MockedStatic<RequestContext> ctx = requestContext()) {
            PromotionResult result = service.promoteStudents(SCHOOL_ID, request, false);

            assertThat(result.dryRun()).isFalse();
            assertThat(result.studentsFound()).isEqualTo(1);
            assertThat(result.studentsPromoted()).isEqualTo(1);
            assertThat(student.getClassId()).isEqualTo(TARGET_CLASS_ID);
            assertThat(student.getSectionId()).isEqualTo(TARGET_SECTION_ID);
            verify(repo).saveAll(List.of(student));
            verify(auditLog).logCriticalMutation(
                    eq(USER_ID),
                    eq(TENANT_ID),
                    any(),
                    eq("Student"),
                    eq(SCHOOL_ID.toString()),
                    any(),
                    any());
        }
    }

    private Student activeStudent(String studentNumber) {
        Student student = Student.create(
                TENANT_ID,
                SCHOOL_ID,
                studentNumber,
                "Asha",
                "Rao",
                LocalDate.now());
        student.setClassId(SOURCE_CLASS_ID);
        student.setSectionId(SOURCE_SECTION_ID);
        return student;
    }

    private StudentPromotionRequest promotionRequest(UUID sourceSectionId) {
        return new StudentPromotionRequest(
                SOURCE_CLASS_ID,
                sourceSectionId,
                TARGET_CLASS_ID,
                TARGET_SECTION_ID);
    }

    private MockedStatic<RequestContext> requestContext() {
        MockedStatic<RequestContext> ctx = mockStatic(RequestContext.class);
        ctx.when(RequestContext::getTenantId).thenReturn(TENANT_ID.toString());
        ctx.when(RequestContext::getUserId).thenReturn(USER_ID);
        return ctx;
    }
}
