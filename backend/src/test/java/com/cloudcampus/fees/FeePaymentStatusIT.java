package com.cloudcampus.fees;

import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.IntegrationTestBase;
import com.cloudcampus.fees.dto.FeeAssignmentCreateRequest;
import com.cloudcampus.fees.dto.FeeAssignmentResponse;
import com.cloudcampus.fees.dto.FeePaymentCreateRequest;
import com.cloudcampus.fees.entity.FeeStatus;
import com.cloudcampus.fees.service.FeesService;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FeePaymentStatusIT extends IntegrationTestBase {

    @Autowired
    private TenantService tenantService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private FeesService feesService;

    private static final String SCHEMA = "school_fees_it";
    private static boolean tenantCreated = false;

    private StudentResponse student;

    @BeforeEach
    void setUp() {
        if (!tenantCreated) {
                        try {
                                tenantService.createTenant(new TenantCreateRequest(
                                                "fees-it", null, "Fees IT School", SCHEMA, null, "#10b981",
                                                "Fees IT Admin", "fees.it.admin", "fees.it.admin@example.com", "9000005001", "Admin@Test123"));
                        } catch (IllegalArgumentException e) {
                                if (!e.getMessage().contains("already exists")) throw e;
                        }
            tenantCreated = true;
        }
        TenantContext.setTenant(SCHEMA);

        // Create a fresh student for each test to avoid cross-test pollution
        String admissionNo = "FIT-" + System.nanoTime();
        student = studentService.createStudent(new StudentCreateRequest(
                admissionNo, "Test", "Student", LocalDate.of(2010, 1, 1),
                Gender.MALE, null, null));

        CloudCampusUserDetails principal = new CloudCampusUserDetails(
                UUID.randomUUID(),
                "fees.it.admin",
                "pwd",
                "fees.it.admin@cloudcampus.local",
                "Fees IT Admin",
                SCHEMA,
                List.of(),
                true
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
                SecurityContextHolder.clearContext();
    }

    @Test
    void newFeeAssignment_statusIsPending() {
        FeeAssignmentCreateRequest request = new FeeAssignmentCreateRequest(
                student.id(), "Term Fee", new BigDecimal("3000.00"), LocalDate.of(2026, 6, 30));

        FeeAssignmentResponse response = feesService.createFeeAssignment(request);

        assertThat(response.status()).isEqualTo(FeeStatus.PENDING);
        assertThat(response.dueAmount()).isEqualByComparingTo(new BigDecimal("3000.00"));
        assertThat(response.paidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void partialPayment_statusBecomesPartiallyPaid() {
        FeeAssignmentResponse assignment = feesService.createFeeAssignment(
                new FeeAssignmentCreateRequest(student.id(), "Activity Fee",
                        new BigDecimal("1000.00"), LocalDate.of(2026, 7, 31)));

        feesService.recordFeePayment(new FeePaymentCreateRequest(
                assignment.id(), new BigDecimal("400.00"), LocalDate.now(),
                "CASH", null));

        List<FeeAssignmentResponse> assignments = feesService.getFeeAssignmentsByStudent(student.id());
        FeeAssignmentResponse updated = assignments.stream()
                .filter(a -> a.id().equals(assignment.id()))
                .findFirst().orElseThrow();

        assertThat(updated.status()).isEqualTo(FeeStatus.PARTIALLY_PAID);
        assertThat(updated.paidAmount()).isEqualByComparingTo(new BigDecimal("400.00"));
        assertThat(updated.dueAmount()).isEqualByComparingTo(new BigDecimal("600.00"));
    }

    @Test
    void fullPayment_statusBecomesPaid() {
        FeeAssignmentResponse assignment = feesService.createFeeAssignment(
                new FeeAssignmentCreateRequest(student.id(), "Registration Fee",
                        new BigDecimal("500.00"), LocalDate.of(2026, 5, 31)));

        feesService.recordFeePayment(new FeePaymentCreateRequest(
                assignment.id(), new BigDecimal("500.00"), LocalDate.now(),
                "BANK_TRANSFER", "REF-001"));

        List<FeeAssignmentResponse> assignments = feesService.getFeeAssignmentsByStudent(student.id());
        FeeAssignmentResponse updated = assignments.stream()
                .filter(a -> a.id().equals(assignment.id()))
                .findFirst().orElseThrow();

        assertThat(updated.status()).isEqualTo(FeeStatus.PAID);
        assertThat(updated.paidAmount()).isEqualByComparingTo(new BigDecimal("500.00"));
        assertThat(updated.dueAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void twoPartialPayments_sumToFull_statusBecomesPaid() {
        FeeAssignmentResponse assignment = feesService.createFeeAssignment(
                new FeeAssignmentCreateRequest(student.id(), "Annual Fee",
                        new BigDecimal("2000.00"), LocalDate.of(2026, 12, 31)));

        feesService.recordFeePayment(new FeePaymentCreateRequest(
                assignment.id(), new BigDecimal("800.00"), LocalDate.now(),
                "CASH", null));
        feesService.recordFeePayment(new FeePaymentCreateRequest(
                assignment.id(), new BigDecimal("1200.00"), LocalDate.now(),
                "CASH", null));

        List<FeeAssignmentResponse> assignments = feesService.getFeeAssignmentsByStudent(student.id());
        FeeAssignmentResponse updated = assignments.stream()
                .filter(a -> a.id().equals(assignment.id()))
                .findFirst().orElseThrow();

        assertThat(updated.status()).isEqualTo(FeeStatus.PAID);
        assertThat(updated.paidAmount()).isEqualByComparingTo(new BigDecimal("2000.00"));
    }

    @Test
    void overpayment_isRejected() {
        FeeAssignmentResponse assignment = feesService.createFeeAssignment(
                new FeeAssignmentCreateRequest(student.id(), "Lab Fee",
                        new BigDecimal("300.00"), LocalDate.of(2026, 8, 31)));

        assertThatThrownBy(() -> feesService.recordFeePayment(new FeePaymentCreateRequest(
                assignment.id(), new BigDecimal("400.00"), LocalDate.now(),
                "CASH", null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("exceeds total fee amount");
    }

    @Test
    void getFeeAssignmentsByStudent_throwsForUnknownStudent() {
        UUID unknownId = UUID.randomUUID();
        assertThatThrownBy(() -> feesService.getFeeAssignmentsByStudent(unknownId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Student not found");
    }
}
