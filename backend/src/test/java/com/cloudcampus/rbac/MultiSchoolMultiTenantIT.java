package com.cloudcampus.rbac;

import com.cloudcampus.auth.entity.UserRole;
import com.cloudcampus.auth.security.JwtUtil;
import com.cloudcampus.exam.entity.Exam;
import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.entity.ExamType;
import com.cloudcampus.exam.repository.ExamRepository;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.notice.entity.NoticeCategory;
import com.cloudcampus.notice.entity.NoticeTarget;
import com.cloudcampus.notice.entity.SchoolNotice;
import com.cloudcampus.notice.repository.SchoolNoticeRepository;
import com.cloudcampus.payment.entity.PaymentOrder;
import com.cloudcampus.payment.repository.PaymentOrderRepository;
import com.cloudcampus.school.entity.AcademicYear;
import com.cloudcampus.school.entity.ClassRoom;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.entity.SchoolStatus;
import com.cloudcampus.school.entity.Section;
import com.cloudcampus.school.entity.Subject;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.ClassRoomRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.school.repository.SectionRepository;
import com.cloudcampus.school.repository.SubjectRepository;
import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.entity.StaffType;
import com.cloudcampus.staff.repository.StaffRepository;
import com.cloudcampus.student.entity.Relationship;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.entity.StudentParentLink;
import com.cloudcampus.student.repository.StudentParentLinkRepository;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.entity.TenantStatus;
import com.cloudcampus.tenant.repository.TenantRepository;
import com.cloudcampus.timetable.entity.DayOfWeek;
import com.cloudcampus.timetable.entity.TimetableSlot;
import com.cloudcampus.timetable.repository.TimetableRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * P0-17 — Multi-school / multi-tenant regression matrix.
 *
 * Locks the ten §6 scenarios that protect tenant boundaries, school boundaries,
 * parent-child ownership, student self-service redaction, payment ownership, and
 * AI per-user rate limiting.
 */
@SpringBootTest(properties = {
        "app.ai.enabled=true",
        "app.ai.chat-provider-bean=p017MockChatModel",
        "app.ai.rate-limit.max-per-user-per-minute=1",
        "app.rate-limit.api.per-user-requests=1",
        "app.rate-limit.api.per-user-window-seconds=60",
        "app.rate-limit.api.per-tenant-requests=100",
        "app.rate-limit.api.per-tenant-window-seconds=60"
})
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("P0-17 — Multi-school / multi-tenant integration matrix")
class MultiSchoolMultiTenantIT {

    @TestConfiguration
    static class AiTestConfig {
        @Bean("p017MockChatModel")
        @Primary
        ChatModel p017MockChatModel() {
            return new ChatModel() {
                @Override
                public ChatResponse call(Prompt prompt) {
                    return new ChatResponse(List.of(
                            new Generation(new AssistantMessage("[P0-17 mock AI]"))));
                }
            };
        }
    }

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("pgvector/pgvector:pg16");

    @Container
    @ServiceConnection
    @SuppressWarnings("resource")
    static final GenericContainer<?> REDIS =
            new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    @Autowired MockMvc mockMvc;
    @Autowired JwtUtil jwtUtil;
    @Autowired JdbcTemplate jdbc;

    @Autowired TenantRepository tenantRepo;
    @Autowired SchoolRepository schoolRepo;
    @Autowired AcademicYearRepository academicYearRepo;
    @Autowired ClassRoomRepository classRoomRepo;
    @Autowired SectionRepository sectionRepo;
    @Autowired SubjectRepository subjectRepo;
    @Autowired StaffRepository staffRepo;
    @Autowired StudentRepository studentRepo;
    @Autowired StudentParentLinkRepository parentLinkRepo;
    @Autowired SchoolNoticeRepository noticeRepo;
    @Autowired TimetableRepository timetableRepo;
    @Autowired ExamRepository examRepo;
    @Autowired ExamResultRepository examResultRepo;
    @Autowired PaymentOrderRepository paymentOrderRepo;

    final UUID tenantA = UUID.randomUUID();
    final UUID tenantB = UUID.randomUUID();
    final UUID parentAUser = UUID.randomUUID();
    final UUID parentBUser = UUID.randomUUID();
    final UUID teacherUser = UUID.randomUUID();
    final UUID branchStudentUser = UUID.randomUUID();
    final UUID otherStudentUser = UUID.randomUUID();
    final UUID aiUser = UUID.randomUUID();
    final UUID tenantBAdminUser = UUID.randomUUID();
    final UUID superAdminUser = UUID.randomUUID();

    School mainSchool;
    School branchSchool;
    School tenantBSchool;
    AcademicYear mainYear;
    AcademicYear branchYear;
    ClassRoom mainClass;
    ClassRoom branchClass;
    Section mainSection;
    Section branchSection;
    Subject branchSubject;
    Staff branchTeacher;
    Student branchStudent;
    Student otherStudent;
    ExamResult completedBranchResult;
    ExamResult draftBranchResult;
    PaymentOrder paymentOrder;

    @BeforeAll
    void seedMatrixData() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        tenantRepo.save(new Tenant(tenantA, "P017-A-" + suffix, "P0-17 Tenant A", TenantStatus.ACTIVE, Instant.now()));
        tenantRepo.save(new Tenant(tenantB, "P017-B-" + suffix, "P0-17 Tenant B", TenantStatus.ACTIVE, Instant.now()));
        seedUser(parentAUser, tenantA, "p017-parent-a-" + suffix + "@example.test", UserRole.PARENT);
        seedUser(parentBUser, tenantA, "p017-parent-b-" + suffix + "@example.test", UserRole.PARENT);
        seedUser(teacherUser, tenantA, "p017-teacher-" + suffix + "@example.test", UserRole.TEACHER);
        seedUser(branchStudentUser, tenantA, "p017-student-branch-" + suffix + "@example.test", UserRole.STUDENT);
        seedUser(otherStudentUser, tenantA, "p017-student-other-" + suffix + "@example.test", UserRole.STUDENT);
        seedUser(aiUser, tenantA, "p017-ai-admin-" + suffix + "@example.test", UserRole.SCHOOL_ADMIN);
        seedUser(tenantBAdminUser, tenantB, "p017-admin-b-" + suffix + "@example.test", UserRole.SCHOOL_ADMIN);
        seedUser(superAdminUser, null, "p017-super-admin-" + suffix + "@example.test", UserRole.SUPER_ADMIN);

        mainSchool = schoolRepo.save(new School(UUID.randomUUID(), tenantA, "Main School", "MAIN-" + suffix,
                SchoolStatus.ACTIVE, Instant.now()));
        branchSchool = schoolRepo.save(new School(UUID.randomUUID(), tenantA, "Branch School", "BRANCH-" + suffix,
                SchoolStatus.ACTIVE, Instant.now()));
        tenantBSchool = schoolRepo.save(new School(UUID.randomUUID(), tenantB, "Other Tenant School", "MAIN-" + suffix,
                SchoolStatus.ACTIVE, Instant.now()));

        mainYear = academicYearRepo.save(AcademicYear.create(tenantA, mainSchool.getId(), "2025-26",
                LocalDate.of(2025, 4, 1), LocalDate.of(2026, 3, 31), true));
        branchYear = academicYearRepo.save(AcademicYear.create(tenantA, branchSchool.getId(), "2025-26",
                LocalDate.of(2025, 4, 1), LocalDate.of(2026, 3, 31), true));
        academicYearRepo.save(AcademicYear.create(tenantB, tenantBSchool.getId(), "2025-26",
                LocalDate.of(2025, 4, 1), LocalDate.of(2026, 3, 31), true));

        mainClass = classRoomRepo.save(ClassRoom.create(tenantA, mainSchool.getId(), mainYear.getId(),
                "Grade 5", (short) 5));
        branchClass = classRoomRepo.save(ClassRoom.create(tenantA, branchSchool.getId(), branchYear.getId(),
                "Grade 5", (short) 5));
        mainSection = sectionRepo.save(Section.create(tenantA, mainSchool.getId(), mainClass.getId(), "A", (short) 40));
        branchSection = sectionRepo.save(Section.create(tenantA, branchSchool.getId(), branchClass.getId(), "B", (short) 40));
        branchSubject = subjectRepo.save(Subject.create(tenantA, branchSchool.getId(),
                "Branch Mathematics", "BMATH-" + suffix, "Branch-only subject"));

        branchTeacher = Staff.create(tenantA, branchSchool.getId(), "T-" + suffix, StaffType.TEACHER,
                "Branch", "Teacher", LocalDate.now());
        branchTeacher.setUserId(teacherUser);
        branchTeacher = staffRepo.save(branchTeacher);

        branchStudent = Student.create(tenantA, branchSchool.getId(), "BR-STU-" + suffix,
                "Branch", "Child", LocalDate.now());
        branchStudent.setUserId(branchStudentUser);
        branchStudent.setClassId(branchClass.getId());
        branchStudent.setSectionId(branchSection.getId());
        branchStudent = studentRepo.save(branchStudent);

        otherStudent = Student.create(tenantA, mainSchool.getId(), "MAIN-STU-" + suffix,
                "Other", "Child", LocalDate.now());
        otherStudent.setUserId(otherStudentUser);
        otherStudent.setClassId(mainClass.getId());
        otherStudent.setSectionId(mainSection.getId());
        otherStudent = studentRepo.save(otherStudent);

        parentLinkRepo.save(StudentParentLink.create(tenantA, branchStudent.getId(), parentAUser, Relationship.FATHER, true));
        parentLinkRepo.save(StudentParentLink.create(tenantA, otherStudent.getId(), parentBUser, Relationship.MOTHER, true));

        noticeRepo.save(SchoolNotice.create(tenantA, mainSchool.getId(), "MAIN ONLY NOTICE",
                "Main school notice must not leak to branch parents.", NoticeCategory.GENERAL,
                NoticeTarget.PARENT, 1, null, parentAUser, true));
        noticeRepo.save(SchoolNotice.create(tenantA, branchSchool.getId(), "BRANCH ONLY NOTICE",
                "Branch school notice for linked branch parent.", NoticeCategory.GENERAL,
                NoticeTarget.PARENT, 1, null, parentAUser, true));

        timetableRepo.save(TimetableSlot.create(tenantA, branchSchool.getId(), branchYear.getId(),
                branchClass.getId(), branchSection.getId(), branchSubject.getId(), branchTeacher.getId(),
                DayOfWeek.MONDAY, (short) 1, LocalTime.of(9, 0), LocalTime.of(9, 45)));

        Exam completedExam = Exam.create(tenantA, branchSchool.getId(), branchYear.getId(), "Completed Branch Exam",
                ExamType.UNIT_TEST, LocalDate.now(), LocalDate.now(), BigDecimal.valueOf(100), BigDecimal.valueOf(35));
        completedExam.complete();
        completedExam = examRepo.save(completedExam);
        completedBranchResult = examResultRepo.save(ExamResult.create(tenantA, completedExam.getId(), branchStudent.getId(),
                branchSchool.getId(), BigDecimal.valueOf(88), BigDecimal.valueOf(100), BigDecimal.valueOf(88), "A", true));

        Exam draftExam = examRepo.save(Exam.create(tenantA, branchSchool.getId(), branchYear.getId(), "Draft Branch Exam",
                ExamType.UNIT_TEST, LocalDate.now(), LocalDate.now(), BigDecimal.valueOf(100), BigDecimal.valueOf(35)));
        draftBranchResult = examResultRepo.save(ExamResult.create(tenantA, draftExam.getId(), branchStudent.getId(),
                branchSchool.getId(), BigDecimal.valueOf(91), BigDecimal.valueOf(100), BigDecimal.valueOf(91), "A", true));

        UUID feeRecordId = seedFeeRecord(suffix);
        paymentOrder = paymentOrderRepo.save(PaymentOrder.create(tenantA, branchSchool.getId(), feeRecordId,
                branchStudent.getId(), parentAUser, "order_p017_" + suffix, 10_000));
    }

    @Test
    @DisplayName("1. Tenant A school admin cannot access Tenant B school-admin path")
    void tenantASchoolAdminCannotAccessTenantBSchool() throws Exception {
        mockMvc.perform(get("/v1/school-admin/schools/{schoolId}/students", tenantBSchool.getId())
                        .header("Authorization", token(UserRole.SCHOOL_ADMIN, tenantA, mainSchool.getId(), UUID.randomUUID())))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("2. Parent linked to BRANCH sees BRANCH notices, results and timetable")
    void branchParentSeesBranchDataNotMainData() throws Exception {
        String auth = token(UserRole.PARENT, tenantA, branchSchool.getId(), parentAUser);

        mockMvc.perform(get("/v1/mobile/notices").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("BRANCH ONLY NOTICE")))
                .andExpect(content().string(not(containsString("MAIN ONLY NOTICE"))));

        mockMvc.perform(get("/v1/parent/children/{studentId}/results", branchStudent.getId())
                        .header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString(completedBranchResult.getId().toString())))
                .andExpect(content().string(not(containsString(draftBranchResult.getId().toString()))));

        mockMvc.perform(get("/v1/parent/children/{studentId}/timetable", branchStudent.getId())
                        .header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString(branchClass.getId().toString())))
                .andExpect(content().string(not(containsString(mainClass.getId().toString()))));
    }

    @Test
    @DisplayName("3. Parent A cannot read Parent B's child")
    void parentCannotReadAnotherParentsChild() throws Exception {
        mockMvc.perform(get("/v1/parent/children/{studentId}/fees", otherStudent.getId())
                        .header("Authorization", token(UserRole.PARENT, tenantA, branchSchool.getId(), parentAUser)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("4. Teacher not assigned to requested class gets 403")
    void teacherCannotListStudentsForUnassignedClass() throws Exception {
        mockMvc.perform(get("/v1/teacher/attendance/students")
                        .param("classId", mainClass.getId().toString())
                        .header("Authorization", token(UserRole.TEACHER, tenantA, branchSchool.getId(), teacherUser)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("5. Student self endpoint returns only own student profile")
    void studentSelfEndpointIsOwnProfileOnly() throws Exception {
        mockMvc.perform(get("/v1/student/profile-360")
                        .header("Authorization", token(UserRole.STUDENT, tenantA, branchSchool.getId(), branchStudentUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.studentId").value(branchStudent.getId().toString()))
                .andExpect(content().string(not(containsString(otherStudent.getId().toString()))));

        mockMvc.perform(get("/v1/school-admin/students/{studentId}", otherStudent.getId())
                        .header("Authorization", token(UserRole.STUDENT, tenantA, branchSchool.getId(), branchStudentUser)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("5a. Portal /me endpoints return the authenticated student, parent and teacher")
    void portalMeEndpointsReturnCurrentUserSnapshots() throws Exception {
        mockMvc.perform(get("/v1/student/me")
                        .header("Authorization", token(UserRole.STUDENT, tenantA, branchSchool.getId(), branchStudentUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.studentId").value(branchStudent.getId().toString()))
                .andExpect(jsonPath("$.data.schoolId").value(branchSchool.getId().toString()))
                .andExpect(content().string(not(containsString(otherStudent.getId().toString()))));

        mockMvc.perform(get("/v1/parent/me")
                        .header("Authorization", token(UserRole.PARENT, tenantA, branchSchool.getId(), parentAUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value(parentAUser.toString()))
                .andExpect(jsonPath("$.data.linkedChildrenCount").value(1))
                .andExpect(jsonPath("$.data.children[0].studentId").value(branchStudent.getId().toString()))
                .andExpect(content().string(not(containsString(otherStudent.getId().toString()))));

        mockMvc.perform(get("/v1/teacher/me")
                        .header("Authorization", token(UserRole.TEACHER, tenantA, branchSchool.getId(), teacherUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.staffId").value(branchTeacher.getId().toString()))
                .andExpect(jsonPath("$.data.schoolId").value(branchSchool.getId().toString()))
                .andExpect(jsonPath("$.data.staffType").value("TEACHER"));
    }

    @Test
    @DisplayName("5b. Audit log viewer is tenant-scoped for school admins and filterable for super admins")
    void auditLogViewerScopesAndFiltersAuditRows() throws Exception {
        String sharedResourceId = "p1-04-" + UUID.randomUUID();
        UUID tenantAEntry = UUID.randomUUID();
        UUID tenantBEntry = UUID.randomUUID();

        jdbc.update("""
                INSERT INTO audit_log
                    (id, tenant_id, actor_id, actor_username, category, event_type,
                     resource_type, resource_id, description, metadata, created_at)
                VALUES
                    (?, ?, ?, 'school-admin-a@example.test', 'FINANCE', 'FINANCE_FEE_WAIVED',
                     'FeeRecord', ?, 'Tenant A fee waiver', '{"reason":"tenant-a"}'::jsonb, now()),
                    (?, ?, ?, 'school-admin-b@example.test', 'FINANCE', 'FINANCE_FEE_WAIVED',
                     'FeeRecord', ?, 'Tenant B fee waiver', '{"reason":"tenant-b"}'::jsonb, now())
                """, tenantAEntry, tenantA, aiUser, sharedResourceId,
                tenantBEntry, tenantB, tenantBAdminUser, sharedResourceId);

        mockMvc.perform(get("/v1/school-admin/audit-logs")
                        .param("category", "FINANCE")
                        .param("resourceType", "FeeRecord")
                        .param("resourceId", sharedResourceId)
                        .param("size", "10")
                        .header("Authorization", token(UserRole.SCHOOL_ADMIN, tenantA, branchSchool.getId(), aiUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].id").value(tenantAEntry.toString()))
                .andExpect(content().string(not(containsString(tenantBEntry.toString()))));

        mockMvc.perform(get("/v1/super-admin/audit-logs")
                        .param("eventType", "FINANCE_FEE_WAIVED")
                        .param("resourceId", sharedResourceId)
                        .param("size", "10")
                        .header("Authorization", token(UserRole.SUPER_ADMIN, null, null, superAdminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(2))
                .andExpect(content().string(containsString(tenantAEntry.toString())))
                .andExpect(content().string(containsString(tenantBEntry.toString())));

        mockMvc.perform(get("/v1/super-admin/audit-logs")
                        .param("tenantId", tenantB.toString())
                        .param("resourceId", sharedResourceId)
                        .param("size", "10")
                        .header("Authorization", token(UserRole.SUPER_ADMIN, null, null, superAdminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].id").value(tenantBEntry.toString()))
                .andExpect(content().string(not(containsString(tenantAEntry.toString()))));
    }

    @Test
    @DisplayName("6. QR mark remains STUDENT-only")
    void qrMarkRejectsNonStudentRoles() throws Exception {
        String body = "{\"token\":\"p017-probe-token\"}";

        mockMvc.perform(post("/v1/student/attendance/qr-mark")
                        .header("Authorization", token(UserRole.TEACHER, tenantA, branchSchool.getId(), teacherUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/v1/student/attendance/qr-mark")
                        .header("Authorization", token(UserRole.PARENT, tenantA, branchSchool.getId(), parentAUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/v1/student/attendance/qr-mark")
                        .header("Authorization", token(UserRole.SCHOOL_ADMIN, tenantA, branchSchool.getId(), UUID.randomUUID()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("7. Payment verify rejects another user's order")
    void verifyPaymentRejectsDifferentInitiator() throws Exception {
        mockMvc.perform(post("/v1/payment/verify")
                        .header("Authorization", token(UserRole.PARENT, tenantA, branchSchool.getId(), parentBUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "paymentOrderId": "%s",
                                  "razorpayOrderId": "%s",
                                  "razorpayPaymentId": "pay_p017_probe",
                                  "razorpaySignature": "sig_p017_probe"
                                }
                                """.formatted(paymentOrder.getId(), paymentOrder.getGatewayOrderId())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("8. Student self-profile redacts restricted aggregates")
    void studentSelfProfileRedactsRestrictedAggregates() throws Exception {
        mockMvc.perform(get("/v1/student/profile-360")
                        .header("Authorization", token(UserRole.STUDENT, tenantA, branchSchool.getId(), branchStudentUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.riskProfile", empty()))
                .andExpect(jsonPath("$.data.communicationCenter").isEmpty())
                .andExpect(content().string(not(containsString("behaviorRecords"))));
    }

    @Test
    @DisplayName("9. Parent results include COMPLETED only; DRAFT result is hidden")
    void parentResultsHideDraftExams() throws Exception {
        mockMvc.perform(get("/v1/parent/children/{studentId}/results", branchStudent.getId())
                        .header("Authorization", token(UserRole.PARENT, tenantA, branchSchool.getId(), parentAUser)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString(completedBranchResult.getId().toString())))
                .andExpect(content().string(not(containsString(draftBranchResult.getId().toString()))));
    }

    @Test
    @DisplayName("10. AI copilot per-user rate limit returns 429 on N+1")
    void aiCopilotRateLimitReturns429() throws Exception {
        String auth = token(UserRole.SCHOOL_ADMIN, tenantA, branchSchool.getId(), aiUser);
        String body = "{\"question\":\"Summarize fee collection steps\",\"contextKeys\":[\"fees\"]}";

        mockMvc.perform(post("/v1/school-admin/ai/query")
                        .header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        mockMvc.perform(post("/v1/school-admin/ai/query")
                        .header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(content().string(containsString("Rate limit exceeded. Please slow down.")));
    }

    private UUID seedFeeRecord(String suffix) {
        UUID feeCategoryId = UUID.randomUUID();
        UUID feeStructureId = UUID.randomUUID();
        UUID feeRecordId = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO fee_categories (id, tenant_id, school_id, name, description, is_active)
                VALUES (?, ?, ?, ?, 'P0-17 fee category', true)
                """, feeCategoryId, tenantA, branchSchool.getId(), "P0-17 Tuition " + suffix);
        jdbc.update("""
                INSERT INTO fee_structures
                    (id, tenant_id, school_id, academic_year_id, class_id, fee_category_id, amount, due_date, frequency)
                VALUES (?, ?, ?, ?, ?, ?, 100.00, current_date + 30, 'ANNUAL')
                """, feeStructureId, tenantA, branchSchool.getId(), branchYear.getId(), branchClass.getId(), feeCategoryId);
        jdbc.update("""
                INSERT INTO student_fee_records
                    (id, tenant_id, school_id, student_id, fee_structure_id, academic_year_id,
                     amount_due, amount_paid, discount, due_date, status)
                VALUES (?, ?, ?, ?, ?, ?, 100.00, 0.00, 0.00, current_date + 30, 'PENDING')
                """, feeRecordId, tenantA, branchSchool.getId(), branchStudent.getId(), feeStructureId, branchYear.getId());
        return feeRecordId;
    }

    private void seedUser(UUID userId, UUID tenantId, String username, UserRole role) {
        jdbc.update("""
                INSERT INTO users
                    (id, tenant_id, username, password_hash, role, status, force_password_change)
                VALUES (?, ?, ?, ?, ?, 'ACTIVE', false)
                """, userId, tenantId, username,
                "$2a$12$012345678901234567890u0123456789012345678901234567890123",
                role.name());
    }

    private String token(UserRole role, UUID tenantId, UUID schoolId, UUID userId) {
        return "Bearer " + jwtUtil.generateAccessToken(userId, tenantId, schoolId, role.name());
    }
}
