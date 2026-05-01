package com.cloudcampus.fees.service;

import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.fees.dto.FeeAssignmentCreateRequest;
import com.cloudcampus.fees.dto.FeeAssignmentResponse;
import com.cloudcampus.fees.dto.FeePaymentCreateRequest;
import com.cloudcampus.fees.entity.FeeAssignment;
import com.cloudcampus.fees.entity.FeePayment;
import com.cloudcampus.fees.entity.FeeStatus;
import com.cloudcampus.fees.repository.FeeAssignmentRepository;
import com.cloudcampus.fees.repository.FeePaymentRepository;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.service.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeesServiceImplTest {

    @Mock
    private FeeAssignmentRepository feeAssignmentRepository;

    @Mock
    private FeePaymentRepository feePaymentRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private FeesServiceImpl feesService;

    private final UUID studentId = UUID.randomUUID();
    private final UUID assignmentId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setTenantContext() {
        TenantContext.setTenant("school_a");
                CloudCampusUserDetails principal = new CloudCampusUserDetails(
                                userId,
                                "fee.admin",
                                "pwd",
                                "fee.admin@cloudcampus.local",
                                "Fee Admin",
                                "school_a",
                                List.of(),
                                true
                );
                SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
                );
    }

    @AfterEach
    void clearTenantContext() {
        TenantContext.clear();
                SecurityContextHolder.clearContext();
    }

    // ── createFeeAssignment ───────────────────────────────────────────────────

    @Test
    void createFeeAssignment_success() {
        FeeAssignmentCreateRequest request = new FeeAssignmentCreateRequest(
                studentId, "Tuition Fee", new BigDecimal("5000.00"), LocalDate.of(2026, 5, 31));

        when(studentRepository.existsById(studentId)).thenReturn(true);

        FeeAssignment saved = buildAssignment(assignmentId, studentId, "Tuition Fee",
                new BigDecimal("5000.00"), FeeStatus.PENDING);
        when(feeAssignmentRepository.save(any(FeeAssignment.class))).thenReturn(saved);

        FeeAssignmentResponse response = feesService.createFeeAssignment(request);

        assertThat(response.status()).isEqualTo(FeeStatus.PENDING);
        assertThat(response.amount()).isEqualByComparingTo("5000.00");
        assertThat(response.paidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.dueAmount()).isEqualByComparingTo("5000.00");
    }

    @Test
    void createFeeAssignment_throwsWhenStudentNotFound() {
        FeeAssignmentCreateRequest request = new FeeAssignmentCreateRequest(
                studentId, "Tuition Fee", new BigDecimal("5000.00"), LocalDate.of(2026, 5, 31));

        when(studentRepository.existsById(studentId)).thenReturn(false);

        assertThatThrownBy(() -> feesService.createFeeAssignment(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Student not found");
    }

    @Test
    void createFeeAssignment_throwsWhenNoTenantContext() {
        TenantContext.setTenant(TenantContext.DEFAULT_SCHEMA);

        FeeAssignmentCreateRequest request = new FeeAssignmentCreateRequest(
                studentId, "Tuition Fee", new BigDecimal("5000.00"), LocalDate.of(2026, 5, 31));

        assertThatThrownBy(() -> feesService.createFeeAssignment(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("X-Tenant-Slug header is required");
    }

    // ── recordFeePayment ──────────────────────────────────────────────────────

    @Test
    void recordFeePayment_partialPayment_setsPartiallyPaid() {
        FeeAssignment assignment = buildAssignment(assignmentId, studentId, "Tuition Fee",
                new BigDecimal("5000.00"), FeeStatus.PENDING);

        FeePaymentCreateRequest request = new FeePaymentCreateRequest(
                assignmentId, new BigDecimal("2000.00"), LocalDate.now(), "CASH", null);

        when(feeAssignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        // No previous payments
        when(feePaymentRepository.findAllByFeeAssignmentId(assignmentId)).thenReturn(List.of());

        FeePayment savedPayment = buildPayment(UUID.randomUUID(), assignment, new BigDecimal("2000.00"));
        when(feePaymentRepository.save(any(FeePayment.class))).thenReturn(savedPayment);
        when(feeAssignmentRepository.save(any(FeeAssignment.class))).thenReturn(assignment);

        feesService.recordFeePayment(request);

        ArgumentCaptor<FeeAssignment> captor = ArgumentCaptor.forClass(FeeAssignment.class);
        verify(feeAssignmentRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(FeeStatus.PARTIALLY_PAID);
    }

    @Test
    void recordFeePayment_fullPayment_setsPaid() {
        FeeAssignment assignment = buildAssignment(assignmentId, studentId, "Tuition Fee",
                new BigDecimal("5000.00"), FeeStatus.PENDING);

        FeePaymentCreateRequest request = new FeePaymentCreateRequest(
                assignmentId, new BigDecimal("5000.00"), LocalDate.now(), "BANK_TRANSFER", "REF001");

        when(feeAssignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(feePaymentRepository.findAllByFeeAssignmentId(assignmentId)).thenReturn(List.of());

        FeePayment savedPayment = buildPayment(UUID.randomUUID(), assignment, new BigDecimal("5000.00"));
        when(feePaymentRepository.save(any(FeePayment.class))).thenReturn(savedPayment);
        when(feeAssignmentRepository.save(any(FeeAssignment.class))).thenReturn(assignment);

        feesService.recordFeePayment(request);

        ArgumentCaptor<FeeAssignment> captor = ArgumentCaptor.forClass(FeeAssignment.class);
        verify(feeAssignmentRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(FeeStatus.PAID);
    }

    @Test
    void recordFeePayment_topUpToFull_setsPaid() {
        FeeAssignment assignment = buildAssignment(assignmentId, studentId, "Tuition Fee",
                new BigDecimal("5000.00"), FeeStatus.PARTIALLY_PAID);

        // Simulate 3000 already paid
        FeePayment previous = buildPayment(UUID.randomUUID(), assignment, new BigDecimal("3000.00"));
        when(feeAssignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(feePaymentRepository.findAllByFeeAssignmentId(assignmentId)).thenReturn(List.of(previous));

        FeePaymentCreateRequest request = new FeePaymentCreateRequest(
                assignmentId, new BigDecimal("2000.00"), LocalDate.now(), "CASH", null);

        FeePayment savedPayment = buildPayment(UUID.randomUUID(), assignment, new BigDecimal("2000.00"));
        when(feePaymentRepository.save(any(FeePayment.class))).thenReturn(savedPayment);
        when(feeAssignmentRepository.save(any(FeeAssignment.class))).thenReturn(assignment);

        feesService.recordFeePayment(request);

        ArgumentCaptor<FeeAssignment> captor = ArgumentCaptor.forClass(FeeAssignment.class);
        verify(feeAssignmentRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(FeeStatus.PAID);
    }

    @Test
    void recordFeePayment_throwsWhenPaymentExceedsFeeAmount() {
        FeeAssignment assignment = buildAssignment(assignmentId, studentId, "Tuition Fee",
                new BigDecimal("5000.00"), FeeStatus.PENDING);

        when(feeAssignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(feePaymentRepository.findAllByFeeAssignmentId(assignmentId)).thenReturn(List.of());

        FeePaymentCreateRequest request = new FeePaymentCreateRequest(
                assignmentId, new BigDecimal("6000.00"), LocalDate.now(), "CASH", null);

        assertThatThrownBy(() -> feesService.recordFeePayment(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Payment exceeds total fee amount");
    }

    @Test
    void recordFeePayment_throwsWhenAssignmentNotFound() {
        when(feeAssignmentRepository.findById(assignmentId)).thenReturn(Optional.empty());

        FeePaymentCreateRequest request = new FeePaymentCreateRequest(
                assignmentId, new BigDecimal("100.00"), LocalDate.now(), "CASH", null);

        assertThatThrownBy(() -> feesService.recordFeePayment(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Fee assignment not found");
    }

    // ── getFeeAssignmentsByStudent ─────────────────────────────────────────────

    @Test
    void getFeeAssignmentsByStudent_computesPaidAndDueAmounts() {
        when(studentRepository.existsById(studentId)).thenReturn(true);

        FeeAssignment assignment = buildAssignment(assignmentId, studentId, "Tuition Fee",
                new BigDecimal("5000.00"), FeeStatus.PARTIALLY_PAID);
        when(feeAssignmentRepository.findAllByStudentId(studentId)).thenReturn(List.of(assignment));

        FeePayment p1 = buildPayment(UUID.randomUUID(), assignment, new BigDecimal("2000.00"));
        FeePayment p2 = buildPayment(UUID.randomUUID(), assignment, new BigDecimal("500.00"));
        when(feePaymentRepository.findAllByFeeAssignmentId(assignmentId)).thenReturn(List.of(p1, p2));

        List<FeeAssignmentResponse> result = feesService.getFeeAssignmentsByStudent(studentId);

        assertThat(result).hasSize(1);
        FeeAssignmentResponse r = result.get(0);
        assertThat(r.paidAmount()).isEqualByComparingTo("2500.00");
        assertThat(r.dueAmount()).isEqualByComparingTo("2500.00");
    }

    @Test
    void getFeeAssignmentsByStudent_throwsWhenStudentNotFound() {
        when(studentRepository.existsById(studentId)).thenReturn(false);

        assertThatThrownBy(() -> feesService.getFeeAssignmentsByStudent(studentId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Student not found");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private FeeAssignment buildAssignment(UUID id, UUID studentId, String title,
                                           BigDecimal amount, FeeStatus status) {
        FeeAssignment a = new FeeAssignment();
        a.setId(id);
        a.setStudentId(studentId);
        a.setFeeTitle(title);
        a.setAmount(amount);
        a.setDueDate(LocalDate.of(2026, 5, 31));
        a.setStatus(status);
        a.setCreatedAt(Instant.now());
        return a;
    }

    private FeePayment buildPayment(UUID id, FeeAssignment assignment, BigDecimal amount) {
        FeePayment p = new FeePayment();
        p.setId(id);
        p.setFeeAssignment(assignment);
        p.setAmountPaid(amount);
        p.setPaymentDate(LocalDate.now());
        p.setPaymentMethod("CASH");
        p.setReceivedByUserId(userId);
        p.setCreatedAt(Instant.now());
        return p;
    }
}
