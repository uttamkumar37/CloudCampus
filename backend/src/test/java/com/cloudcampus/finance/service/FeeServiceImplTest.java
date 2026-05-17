package com.cloudcampus.finance.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.finance.dto.RecordPaymentRequest;
import com.cloudcampus.finance.entity.FeePayment;
import com.cloudcampus.finance.entity.FeeStatus;
import com.cloudcampus.finance.entity.PaymentMode;
import com.cloudcampus.finance.entity.StudentFeeRecord;
import com.cloudcampus.finance.repository.FeeCategoryRepository;
import com.cloudcampus.finance.repository.FeePaymentRepository;
import com.cloudcampus.finance.repository.FeeStructureRepository;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeeServiceImplTest {

    @Mock FeeCategoryRepository      categoryRepo;
    @Mock FeeStructureRepository     structureRepo;
    @Mock StudentFeeRecordRepository recordRepo;
    @Mock FeePaymentRepository       paymentRepo;
    @Mock com.cloudcampus.common.metrics.BusinessMetrics metrics;

    FeeServiceImpl feeService;

    static final UUID TENANT_ID = UUID.randomUUID();
    static final UUID RECORD_ID = UUID.randomUUID();
    static final UUID SCHOOL_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        feeService = new FeeServiceImpl(categoryRepo, structureRepo, recordRepo, paymentRepo, metrics);
    }

    // ── waiveRecord ──────────────────────────────────────────────────────────

    @Test
    void waiveRecord_whenPending_setsStatusToWaived() {
        StudentFeeRecord record = pendingRecord();
        stubFoundRecord(record);
        when(structureRepo.findById(any())).thenReturn(Optional.empty());
        when(recordRepo.save(record)).thenReturn(record);

        try (MockedStatic<RequestContext> ctx = tenantContext()) {
            feeService.waiveRecord(RECORD_ID);
        }

        assertThat(record.getStatus()).isEqualTo(FeeStatus.WAIVED);
        verify(recordRepo).save(record);
    }

    @Test
    void waiveRecord_whenAlreadyPaid_throwsBadRequest() {
        StudentFeeRecord paid = mock(StudentFeeRecord.class);
        when(paid.getStatus()).thenReturn(FeeStatus.PAID);
        stubFoundRecord(paid);

        try (MockedStatic<RequestContext> ctx = tenantContext()) {
            assertThatThrownBy(() -> feeService.waiveRecord(RECORD_ID))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Cannot waive");
        }
    }

    // ── recordPayment ────────────────────────────────────────────────────────

    @Test
    void recordPayment_whenPending_savesPaymentAndUpdatesRecord() {
        StudentFeeRecord record = pendingRecord();
        stubFoundRecord(record);
        when(paymentRepo.nextReceiptSequence()).thenReturn(42L);

        FeePayment savedPayment = mock(FeePayment.class);
        when(savedPayment.getId()).thenReturn(UUID.randomUUID());
        when(savedPayment.getStudentFeeRecordId()).thenReturn(RECORD_ID);
        when(savedPayment.getAmount()).thenReturn(BigDecimal.valueOf(5000));
        when(savedPayment.getPaymentDate()).thenReturn(LocalDate.now());
        when(savedPayment.getPaymentMode()).thenReturn(PaymentMode.CASH);
        when(savedPayment.getReceiptNumber()).thenReturn("RCT-2026-0000042");
        when(savedPayment.getCreatedAt()).thenReturn(Instant.now());
        when(paymentRepo.save(any())).thenReturn(savedPayment);

        RecordPaymentRequest req = new RecordPaymentRequest(
                BigDecimal.valueOf(5000), LocalDate.now(), PaymentMode.CASH,
                null, null, null);

        try (MockedStatic<RequestContext> ctx = tenantContext()) {
            feeService.recordPayment(RECORD_ID, req);
        }

        verify(paymentRepo).save(any());
        verify(recordRepo, atLeastOnce()).save(record);
    }

    @Test
    void recordPayment_whenAlreadyPaid_throwsBadRequest() {
        StudentFeeRecord paid = mock(StudentFeeRecord.class);
        when(paid.getStatus()).thenReturn(FeeStatus.PAID);
        stubFoundRecord(paid);

        RecordPaymentRequest req = new RecordPaymentRequest(
                BigDecimal.valueOf(100), LocalDate.now(), PaymentMode.CASH,
                null, null, null);

        try (MockedStatic<RequestContext> ctx = tenantContext()) {
            assertThatThrownBy(() -> feeService.recordPayment(RECORD_ID, req))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("already");
        }
    }

    // ── tenant isolation (CRIT-14) ────────────────────────────────────────────

    @Test
    void getRecord_whenTenantMismatch_throwsNotFoundException() {
        // Validates the CRIT-14 fix: findByIdAndTenantId() is used instead of
        // findById(), so a cross-tenant UUID returns 404 rather than the record.
        when(recordRepo.findByIdAndTenantId(RECORD_ID, TENANT_ID))
                .thenReturn(Optional.empty());

        try (MockedStatic<RequestContext> ctx = tenantContext()) {
            assertThatThrownBy(() -> feeService.getRecord(RECORD_ID))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private StudentFeeRecord pendingRecord() {
        return StudentFeeRecord.create(
                TENANT_ID, SCHOOL_ID,
                UUID.randomUUID(),  // studentId
                UUID.randomUUID(),  // feeStructureId
                UUID.randomUUID(),  // academicYearId
                BigDecimal.valueOf(10000),
                BigDecimal.ZERO,    // discount
                LocalDate.now().plusMonths(1),
                null);
    }

    private void stubFoundRecord(StudentFeeRecord record) {
        when(recordRepo.findByIdAndTenantId(RECORD_ID, TENANT_ID))
                .thenReturn(Optional.of(record));
    }

    private MockedStatic<RequestContext> tenantContext() {
        MockedStatic<RequestContext> ctx = mockStatic(RequestContext.class);
        ctx.when(RequestContext::getTenantId).thenReturn(TENANT_ID.toString());
        return ctx;
    }
}
