package com.cloudcampus.student;

import com.cloudcampus.IntegrationTestBase;
import com.cloudcampus.student.dto.StudentCreateRequest;
import com.cloudcampus.student.dto.StudentResponse;
import com.cloudcampus.student.entity.Gender;
import com.cloudcampus.student.service.StudentService;
import com.cloudcampus.tenant.dto.TenantCreateRequest;
import com.cloudcampus.tenant.service.TenantContext;
import com.cloudcampus.tenant.service.TenantService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StudentCrudIT extends IntegrationTestBase {

    @Autowired
    private TenantService tenantService;

    @Autowired
    private StudentService studentService;

    private static final String SCHEMA = "school_student_it";
    private static boolean tenantCreated = false;

    @BeforeEach
    void setUp() {
        if (!tenantCreated) {
                        try {
                                tenantService.createTenant(new TenantCreateRequest(
                                                "student-it", null, "Student IT School", SCHEMA, null, "#10b981",
                                                "Student IT Admin", "student.it.admin", "student.it.admin@example.com", "9000002001", "Admin@Test123"));
                        } catch (IllegalArgumentException e) {
                                if (!e.getMessage().contains("already exists")) throw e;
                        }
            tenantCreated = true;
        }
        TenantContext.setTenant(SCHEMA);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void createStudent_persistsAndReturnsStudent() {
        StudentCreateRequest request = new StudentCreateRequest(
                "IT-001", "Alice", "Smith", LocalDate.of(2010, 3, 15),
                Gender.FEMALE, "alice@school.com", "0700000001");

        StudentResponse response = studentService.createStudent(request);

        assertThat(response.id()).isNotNull();
        assertThat(response.admissionNo()).isEqualTo("IT-001");
        assertThat(response.firstName()).isEqualTo("Alice");
        assertThat(response.active()).isTrue();
        assertThat(response.createdAt()).isNotNull();
    }

    @Test
    void getStudentById_returnsExistingStudent() {
        StudentCreateRequest request = new StudentCreateRequest(
                "IT-002", "Bob", "Jones", LocalDate.of(2011, 6, 20),
                Gender.MALE, null, null);

        StudentResponse created = studentService.createStudent(request);
        StudentResponse fetched = studentService.getStudentById(created.id());

        assertThat(fetched.id()).isEqualTo(created.id());
        assertThat(fetched.admissionNo()).isEqualTo("IT-002");
    }

    @Test
    void getStudents_returnsOnlyNonDeletedStudents() {
        StudentCreateRequest r1 = new StudentCreateRequest(
                "IT-003", "Carol", "White", LocalDate.of(2012, 1, 10),
                Gender.FEMALE, null, null);
        StudentCreateRequest r2 = new StudentCreateRequest(
                "IT-004", "Dan", "Brown", LocalDate.of(2012, 7, 22),
                Gender.MALE, null, null);

        StudentResponse s1 = studentService.createStudent(r1);
        StudentResponse s2 = studentService.createStudent(r2);

        // Soft-delete s2
        studentService.softDeleteStudent(s2.id());

        Page<StudentResponse> page = studentService.getStudents(PageRequest.of(0, 50));
        assertThat(page.getContent()).extracting(StudentResponse::id).contains(s1.id());
        assertThat(page.getContent()).extracting(StudentResponse::id).doesNotContain(s2.id());
    }

    @Test
    void softDeleteStudent_makesStudentInvisible() {
        StudentCreateRequest request = new StudentCreateRequest(
                "IT-005", "Eve", "Davis", LocalDate.of(2013, 4, 5),
                Gender.FEMALE, null, null);

        StudentResponse created = studentService.createStudent(request);
        studentService.softDeleteStudent(created.id());

        assertThatThrownBy(() -> studentService.getStudentById(created.id()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Student not found");
    }

    @Test
    void softDeleteStudent_throwsWhenAlreadyDeleted() {
        StudentCreateRequest request = new StudentCreateRequest(
                "IT-006", "Frank", "Miller", LocalDate.of(2014, 9, 18),
                Gender.MALE, null, null);

        StudentResponse created = studentService.createStudent(request);
        studentService.softDeleteStudent(created.id());

        assertThatThrownBy(() -> studentService.softDeleteStudent(created.id()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Student not found");
    }

    @Test
    void createStudent_throwsOnDuplicateAdmissionNo() {
        StudentCreateRequest first = new StudentCreateRequest(
                "IT-007", "Grace", "Lee", LocalDate.of(2010, 5, 12),
                Gender.FEMALE, null, null);
        studentService.createStudent(first);

        StudentCreateRequest duplicate = new StudentCreateRequest(
                "IT-007", "Another", "Student", LocalDate.of(2011, 3, 8),
                Gender.MALE, null, null);

        assertThatThrownBy(() -> studentService.createStudent(duplicate))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Admission number already exists");
    }
}
