package com.cloudcampus.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;

class HardCodedMainSchoolResolutionTest {

    private static final Path MAIN_SOURCE_ROOT = Path.of("src/main/java");
    private static final Set<String> ALLOWED_MAIN_REFERENCES = Set.of(
            "com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingService.java",
            "com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java"
    );
    private static final List<String> PROHIBITED_SCHOOL_RESOLUTION_MARKERS = List.of(
            "\"MAIN\"",
            "'MAIN'",
            "resolveMainSchool",
            "defaultSchool",
            "primary school fallback"
    );

    @Test
    void businessLogicDoesNotHardCodeMainSchoolResolution() throws IOException {
        List<String> violations = javaSourcesUnder(MAIN_SOURCE_ROOT)
                .filter(path -> !ALLOWED_MAIN_REFERENCES.contains(relative(path)))
                .filter(this::containsProhibitedSchoolResolutionMarker)
                .map(this::relative)
                .sorted()
                .toList();

        assertThat(violations)
                .as("Business logic must resolve school from authenticated/selected/linked/assigned context, not hard-coded MAIN.")
                .isEmpty();
    }

    @Test
    void reservedMainGuardsAreTheOnlyAllowedMainSchoolReferences() throws IOException {
        Path onboardingService = MAIN_SOURCE_ROOT.resolve("com/cloudcampus/platform/superadmin/onboarding/TenantOnboardingService.java");
        Path tenantAdminSchoolService = MAIN_SOURCE_ROOT.resolve("com/cloudcampus/platform/tenantadmin/school/TenantAdminSchoolService.java");

        assertThat(Files.readString(onboardingService, StandardCharsets.UTF_8))
                .contains("RESERVED_MAIN_CODE")
                .contains("\"MAIN\"");
        assertThat(Files.readString(tenantAdminSchoolService, StandardCharsets.UTF_8))
                .contains("RESERVED_MAIN_CODE")
                .contains("\"MAIN\"");
    }

    @Test
    void parentStudentAndTeacherSourcesDoNotUseMainFallbackWherePresent() throws IOException {
        List<String> violations = Stream.of(
                        MAIN_SOURCE_ROOT.resolve("com/cloudcampus/people/parent"),
                        MAIN_SOURCE_ROOT.resolve("com/cloudcampus/people/student"),
                        MAIN_SOURCE_ROOT.resolve("com/cloudcampus/people/teacher")
                )
                .filter(Files::exists)
                .flatMap(this::javaSourcesUnderUnchecked)
                .filter(this::containsProhibitedSchoolResolutionMarker)
                .map(this::relative)
                .sorted()
                .toList();

        assertThat(violations)
                .as("Parent, student, and teacher flows must resolve school from linked child, own record, or assignment.")
                .isEmpty();
    }

    private Stream<Path> javaSourcesUnderUnchecked(Path root) {
        try {
            return javaSourcesUnder(root);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to inspect Java sources under " + root, ex);
        }
    }

    private Stream<Path> javaSourcesUnder(Path root) throws IOException {
        return Files.walk(root)
                .filter(Files::isRegularFile)
                .filter(path -> path.getFileName().toString().endsWith(".java"));
    }

    private boolean containsProhibitedSchoolResolutionMarker(Path path) {
        try {
            String source = Files.readString(path, StandardCharsets.UTF_8);
            String lowerSource = source.toLowerCase();
            return PROHIBITED_SCHOOL_RESOLUTION_MARKERS.stream()
                    .anyMatch(marker -> source.contains(marker) || lowerSource.contains(marker));
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to inspect Java source " + path, ex);
        }
    }

    private String relative(Path path) {
        return MAIN_SOURCE_ROOT.relativize(path).toString();
    }
}
