package com.cloudcampus.audit;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;

class AuditCoverageMatrixTest {

    private static final Path MAIN_SOURCE_ROOT = Path.of("src/main/java");
    private static final Map<String, AuditEvidence> AUDITED_MUTATION_CONTROLLERS = Map.ofEntries(
            Map.entry(
                    "com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingController.java",
                    evidence(
                            "com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingService.java",
                            "TENANT_CREATED",
                            "SCHOOL_CREATED",
                            "SCHOOL_ADMIN_INVITED",
                            "SCHOOL_ACCESS_GRANTED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolController.java",
                    evidence(
                            "com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java",
                            "SCHOOL_CREATED",
                            "SCHOOL_UPDATED",
                            "SCHOOL_DEACTIVATED",
                            "SCHOOL_ADMIN_INVITED",
                            "SCHOOL_ADMIN_INVITATION_RESENT",
                            "SCHOOL_ACCESS_REVOKED",
                            "SCHOOL_ACCESS_GRANTED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsController.java",
                    evidence(
                            "com/cloudcampus/platform/tenantadmin/settings/TenantAdminSettingsService.java",
                            "TENANT_SETTINGS_UPDATED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/platform/subscription/SuperAdminSubscriptionController.java",
                    evidence(
                            "com/cloudcampus/platform/subscription/SuperAdminSubscriptionService.java",
                            "SUBSCRIPTION_PLAN_CREATED",
                            "SUBSCRIPTION_PLAN_UPDATED",
                            "TENANT_SUBSCRIPTION_ASSIGNED",
                            "TENANT_INVOICE_ISSUED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/platform/superadmin/control/SuperAdminPlatformController.java",
                    evidence(
                            "com/cloudcampus/platform/superadmin/control/SuperAdminPlatformService.java",
                            "TENANT_STATUS_UPDATED",
                            "TENANT_SETTINGS_UPDATED",
                            "PLATFORM_SETTINGS_UPDATED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/intelligence/ai/SuperAdminAiEntitlementController.java",
                    evidence(
                            "com/cloudcampus/intelligence/ai/AiGovernanceService.java",
                            "AI_ENTITLEMENT_UPDATED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/intelligence/ai/AiUsageController.java",
                    evidence(
                            "com/cloudcampus/intelligence/ai/AiGovernanceService.java",
                            "AI_USAGE_AUDITED",
                            "AI_USAGE_DENIED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/intelligence/ai/SchoolAdminAiKnowledgeController.java",
                    evidence(
                            "com/cloudcampus/intelligence/ai/AiKnowledgeRetrievalService.java",
                            "AI_KNOWLEDGE_DOCUMENT_CREATED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/intelligence/ai/AiRetrievalController.java",
                    evidence(
                            "com/cloudcampus/intelligence/ai/AiKnowledgeRetrievalService.java",
                            "AI_RETRIEVAL_AUDITED",
                            "AI_RETRIEVAL_DENIED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/identity/auth/invitation/InvitationController.java",
                    evidence("com/cloudcampus/identity/auth/invitation/InvitationAcceptanceService.java", "INVITATION_ACCEPTED")
            ),
            Map.entry(
                    "com/cloudcampus/identity/auth/session/AuthController.java",
                    evidence(
                            "com/cloudcampus/identity/auth/session/AuthSessionService.java",
                            "MFA_CHALLENGE_CREATED",
                            "MFA_CHALLENGE_VERIFIED",
                            "REFRESH_TOKEN_ROTATED",
                            "PASSWORD_RESET_REQUESTED",
                            "PASSWORD_RESET_COMPLETED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/identity/auth/session/CurrentUserController.java",
                    evidence(
                            "com/cloudcampus/identity/auth/session/AuthSessionService.java",
                            "SCHOOL_CONTEXT_ACTIVATED",
                            "PASSWORD_CHANGED",
                            "USER_LOGGED_OUT"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/people/parent/ParentLinkController.java",
                    evidence("com/cloudcampus/people/parent/ParentLinkService.java", "PARENT_INVITED", "PARENT_LINKED")
            ),
            Map.entry(
                    "com/cloudcampus/people/parent/ParentLeaveRequestController.java",
                    evidence(
                            "com/cloudcampus/people/parent/ParentLeaveRequestService.java",
                            "PARENT_LEAVE_REQUESTED",
                            "PARENT_LEAVE_DECIDED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/people/staff/StaffProvisioningController.java",
                    evidence(
                            "com/cloudcampus/people/staff/StaffProvisioningService.java",
                            "STAFF_INVITED",
                            "STAFF_PROFILE_CREATED",
                            "SCHOOL_ACCESS_GRANTED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/school/SchoolSettingsController.java",
                    evidence("com/cloudcampus/school/SchoolSettingsService.java", "SCHOOL_UPDATED")
            ),
            Map.entry(
                    "com/cloudcampus/people/student/StudentImportController.java",
                    evidence(
                            "com/cloudcampus/people/student/StudentImportService.java",
                            "STUDENT_IMPORTED",
                            "STUDENT_IMPORT_JOB_QUEUED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/people/student/StudentLoginController.java",
                    evidence(
                            "com/cloudcampus/people/student/StudentLoginService.java",
                            "STUDENT_LOGIN_INVITED",
                            "STUDENT_LOGIN_ENABLED",
                            "SCHOOL_ACCESS_GRANTED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/academic/AcademicYearController.java",
                    evidence(
                            "com/cloudcampus/academic/AcademicLifecycleService.java",
                            "ACADEMIC_YEAR_CREATED",
                            "ACADEMIC_YEAR_ACTIVATED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/academic/ClassLevelController.java",
                    evidence("com/cloudcampus/academic/AcademicLifecycleService.java", "CLASS_LEVEL_CREATED")
            ),
            Map.entry(
                    "com/cloudcampus/academic/SectionController.java",
                    evidence("com/cloudcampus/academic/AcademicLifecycleService.java", "SECTION_CREATED")
            ),
            Map.entry(
                    "com/cloudcampus/academic/SubjectController.java",
                    evidence("com/cloudcampus/academic/AcademicAssignmentService.java", "SUBJECT_CREATED")
            ),
            Map.entry(
                    "com/cloudcampus/academic/ClassSubjectAssignmentController.java",
                    evidence("com/cloudcampus/academic/AcademicAssignmentService.java", "CLASS_SUBJECT_ASSIGNED")
            ),
            Map.entry(
                    "com/cloudcampus/academic/TeacherAssignmentController.java",
                    evidence("com/cloudcampus/academic/AcademicAssignmentService.java", "TEACHER_ASSIGNED")
            ),
            Map.entry(
                    "com/cloudcampus/operations/bulk/BulkJobController.java",
                    evidence(
                            "com/cloudcampus/operations/bulk/BulkJobService.java",
                            "BULK_JOB_CREATED",
                            "BULK_JOB_CANCELLED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/operations/finance/FeeController.java",
                    evidence(
                            "com/cloudcampus/operations/finance/FeeService.java",
                            "FEE_DEMAND_CREATED",
                            "FEE_PAYMENT_RECORDED",
                            "RECEIPT_ISSUED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/operations/attendance/AttendanceController.java",
                    evidence(
                            "com/cloudcampus/operations/attendance/AttendanceService.java",
                            "ATTENDANCE_SUBMITTED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/operations/homework/HomeworkController.java",
                    evidence(
                            "com/cloudcampus/operations/homework/HomeworkService.java",
                            "HOMEWORK_PUBLISHED",
                            "HOMEWORK_SUBMITTED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/operations/exam/ExamController.java",
                    evidence(
                            "com/cloudcampus/operations/exam/ExamService.java",
                            "EXAM_CREATED",
                            "EXAM_MARKS_RECORDED",
                            "EXAM_RESULTS_PUBLISHED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/operations/notice/NoticeController.java",
                    evidence(
                            "com/cloudcampus/operations/notice/NoticeService.java",
                            "NOTICE_CREATED",
                            "NOTICE_PUBLISHED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/operations/timetable/TimetableController.java",
                    evidence("com/cloudcampus/operations/timetable/TimetableService.java", "TIMETABLE_ENTRY_CREATED")
            ),
            Map.entry(
                    "com/cloudcampus/operations/document/SchoolDocumentController.java",
                    evidence("com/cloudcampus/operations/document/SchoolDocumentService.java", "DOCUMENT_CREATED")
            ),
            Map.entry(
                    "com/cloudcampus/operations/website/WebsiteController.java",
                    evidence(
                            "com/cloudcampus/operations/website/WebsiteService.java",
                            "WEBSITE_PAGE_CREATED",
                            "WEBSITE_PAGE_PUBLISHED"
                    )
            ),
            Map.entry(
                    "com/cloudcampus/operations/report/ReportExportController.java",
                    evidence(
                            "com/cloudcampus/operations/report/ReportExportService.java",
                            "REPORT_EXPORT_REQUESTED",
                            "REPORT_EXPORT_COMPLETED"
                    )
            )
    );

    @Test
    void everyMutationControllerIsInTheAuditCoverageMatrix() throws IOException {
        List<String> unmappedControllers = javaSourcesUnder(MAIN_SOURCE_ROOT)
                .filter(this::isController)
                .filter(this::hasMutationEndpoint)
                .map(this::relative)
                .filter(controller -> !AUDITED_MUTATION_CONTROLLERS.containsKey(controller))
                .sorted()
                .toList();

        assertThat(unmappedControllers)
                .as("Every controller with POST/PUT/PATCH/DELETE routes must be audited or intentionally added to this matrix.")
                .isEmpty();
    }

    @Test
    void auditCoverageMatrixPointsAtRealAuditWritesAndActions() {
        AUDITED_MUTATION_CONTROLLERS.forEach((controller, evidence) -> {
            String source = source(MAIN_SOURCE_ROOT.resolve(evidence.servicePath()));
            assertThat(source)
                    .as(controller + " must delegate to a service that writes audit rows.")
                    .contains("auditLogService.record");
            assertThat(source)
                    .as(controller + " audit service must use typed audit actions.")
                    .contains("AuditAction");
            for (String action : evidence.actions()) {
                assertThat(source)
                        .as(controller + " must write " + action)
                        .contains("AuditAction." + action);
            }
        });
    }

    private Stream<Path> javaSourcesUnder(Path root) throws IOException {
        return Files.walk(root)
                .filter(Files::isRegularFile)
                .filter(path -> path.getFileName().toString().endsWith(".java"));
    }

    private boolean isController(Path path) {
        String source = source(path);
        return !source.contains("@ControllerAdvice")
                && !source.contains("@RestControllerAdvice")
                && (source.contains("@RestController") || source.contains("@Controller"));
    }

    private boolean hasMutationEndpoint(Path path) {
        String source = source(path);
        return source.contains("@PostMapping")
                || source.contains("@PutMapping")
                || source.contains("@PatchMapping")
                || source.contains("@DeleteMapping");
    }

    private String source(Path path) {
        try {
            return Files.readString(path, StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to inspect Java source " + path, ex);
        }
    }

    private String relative(Path path) {
        return MAIN_SOURCE_ROOT.relativize(path).toString();
    }

    private static AuditEvidence evidence(String servicePath, String... actions) {
        return new AuditEvidence(servicePath, List.of(actions));
    }

    private record AuditEvidence(String servicePath, List<String> actions) {
    }
}
