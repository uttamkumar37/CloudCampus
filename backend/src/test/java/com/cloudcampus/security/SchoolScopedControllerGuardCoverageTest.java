package com.cloudcampus.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;

class SchoolScopedControllerGuardCoverageTest {

    private static final Path MAIN_SOURCE_ROOT = Path.of("src/main/java");
    private static final List<String> SCHOOL_SCOPED_SEGMENTS = List.of(
            "student",
            "academic",
            "classlevel",
            "section",
            "staff",
            "attendance",
            "homework",
            "exam",
            "result",
            "fee",
            "finance",
            "receipt",
            "payment",
            "notice",
            "timetable",
            "document",
            "report",
            "website",
            "bulk"
    );
    private static final List<String> APPROVED_GUARD_MARKERS = List.of(
            "SchoolAccessService",
            "requireSchoolAdminAccess",
            "AuthenticatedUserResolver",
            "AuthSessionService",
            "ParentStudent",
            "ParentChild",
            "TeacherAssignment",
            "teacherAssignment",
            "linkedChild",
            "assignedClass"
    );

    @Test
    void everyRealSchoolScopedControllerUsesABackendSchoolGuard() throws IOException {
        List<String> unguardedControllers = javaSourcesUnder(MAIN_SOURCE_ROOT)
                .filter(this::isController)
                .filter(this::isSchoolScopedController)
                .filter(path -> !hasApprovedGuardMarker(path))
                .map(this::relative)
                .sorted()
                .toList();

        assertThat(unguardedControllers)
                .as("School-scoped controllers must verify school access from backend state, not frontend-supplied schoolId alone.")
                .isEmpty();
    }

    @Test
    void currentScaffoldHasOnlyApprovedSchoolScopedBusinessControllers() throws IOException {
        List<String> schoolScopedControllers = javaSourcesUnder(MAIN_SOURCE_ROOT)
                .filter(this::isController)
                .filter(this::isSchoolScopedController)
                .filter(path -> !isApprovedCurrentScaffoldController(path))
                .map(this::relative)
                .sorted()
                .toList();

        assertThat(schoolScopedControllers)
                .as("SEC-006 inventory: future school-scoped business controllers must be added with backend guard tests.")
                .isEmpty();
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

    private boolean isSchoolScopedController(Path path) {
        String haystack = (relative(path) + "\n" + source(path)).toLowerCase(Locale.ROOT);
        return SCHOOL_SCOPED_SEGMENTS.stream().anyMatch(haystack::contains);
    }

    private boolean hasApprovedGuardMarker(Path path) {
        String source = source(path);
        return APPROVED_GUARD_MARKERS.stream().anyMatch(source::contains);
    }

    private boolean isApprovedCurrentScaffoldController(Path path) {
        return List.of(
                "com/cloudcampus/academic/AcademicYearController.java",
                "com/cloudcampus/academic/ClassLevelController.java",
                "com/cloudcampus/academic/ClassSubjectAssignmentController.java",
                "com/cloudcampus/academic/SectionController.java",
                "com/cloudcampus/academic/SubjectController.java",
                "com/cloudcampus/academic/TeacherAssignmentController.java",
                "com/cloudcampus/academic/TeacherAssignmentPortalController.java",
                "com/cloudcampus/intelligence/ai/SchoolAdminAiKnowledgeController.java",
                "com/cloudcampus/people/parent/ParentLeaveRequestController.java",
                "com/cloudcampus/people/parent/ParentPortalController.java",
                "com/cloudcampus/people/staff/StaffProvisioningController.java",
                "com/cloudcampus/people/student/StudentImportController.java",
                "com/cloudcampus/people/student/StudentLoginController.java",
                "com/cloudcampus/operations/attendance/AttendanceController.java",
                "com/cloudcampus/operations/homework/HomeworkController.java",
                "com/cloudcampus/operations/exam/ExamController.java",
                "com/cloudcampus/operations/notice/NoticeController.java",
                "com/cloudcampus/operations/report/ReportExportController.java",
                "com/cloudcampus/platform/tenantadmin/report/TenantAdminReportController.java",
                "com/cloudcampus/operations/bulk/BulkJobController.java",
                "com/cloudcampus/operations/finance/FeeController.java"
        ).contains(relative(path));
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
}
