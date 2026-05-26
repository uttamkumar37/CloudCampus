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
                    "com/cloudcampus/people/staff/StaffProvisioningController.java",
                    evidence(
                            "com/cloudcampus/people/staff/StaffProvisioningService.java",
                            "STAFF_INVITED",
                            "STAFF_PROFILE_CREATED",
                            "SCHOOL_ACCESS_GRANTED"
                    )
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
