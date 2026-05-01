package com.cloudcampus.fees.service;

import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.fees.dto.FeeAssignmentCreateRequest;
import com.cloudcampus.fees.dto.FeeAssignmentResponse;
import com.cloudcampus.fees.dto.FeePaymentCreateRequest;
import com.cloudcampus.fees.dto.FeePaymentResponse;
import com.cloudcampus.fees.entity.FeeAssignment;
import com.cloudcampus.fees.entity.FeePayment;
import com.cloudcampus.fees.entity.FeeStatus;
import com.cloudcampus.fees.repository.FeeAssignmentRepository;
import com.cloudcampus.fees.repository.FeePaymentRepository;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.service.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeesServiceImpl implements FeesService {

    private final FeeAssignmentRepository feeAssignmentRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final StudentRepository studentRepository;

    @Override
    @Transactional
    public FeeAssignmentResponse createFeeAssignment(FeeAssignmentCreateRequest request) {
        validateTenantContext();

        if (!studentRepository.existsById(request.studentId())) {
            throw new IllegalArgumentException("Student not found: " + request.studentId());
        }

        FeeAssignment assignment = new FeeAssignment();
        assignment.setStudentId(request.studentId());
        assignment.setFeeTitle(request.feeTitle().trim());
        assignment.setAmount(request.amount());
        assignment.setDueDate(request.dueDate());
        assignment.setStatus(FeeStatus.PENDING);

        FeeAssignment saved = feeAssignmentRepository.save(assignment);
        log.info("Fee assignment created: id={}, studentId={}, tenant={}", saved.getId(), saved.getStudentId(), TenantContext.getTenant());
        return mapAssignment(saved, BigDecimal.ZERO);
    }

    @Override
    @Transactional
    public FeePaymentResponse recordFeePayment(FeePaymentCreateRequest request) {
        validateTenantContext();

        FeeAssignment assignment = feeAssignmentRepository.findById(request.feeAssignmentId())
                .orElseThrow(() -> new IllegalArgumentException("Fee assignment not found: " + request.feeAssignmentId()));

        BigDecimal currentPaid = getTotalPaidAmount(assignment.getId());
        BigDecimal newPaid = currentPaid.add(request.amountPaid());

        if (newPaid.compareTo(assignment.getAmount()) > 0) {
            throw new IllegalArgumentException("Payment exceeds total fee amount");
        }

        FeePayment payment = new FeePayment();
        payment.setFeeAssignment(assignment);
        payment.setAmountPaid(request.amountPaid());
        payment.setPaymentDate(request.paymentDate());
        payment.setPaymentMethod(request.paymentMethod().trim());
        payment.setReferenceNo(normalizeNullable(request.referenceNo()));
        payment.setReceivedByUserId(requireCurrentUserId());

        FeePayment savedPayment = feePaymentRepository.save(payment);

        if (newPaid.compareTo(BigDecimal.ZERO) == 0) {
            assignment.setStatus(FeeStatus.PENDING);
        } else if (newPaid.compareTo(assignment.getAmount()) == 0) {
            assignment.setStatus(FeeStatus.PAID);
        } else {
            assignment.setStatus(FeeStatus.PARTIALLY_PAID);
        }
        feeAssignmentRepository.save(assignment);

        log.info("Fee payment recorded: paymentId={}, assignmentId={}, tenant={}",
                savedPayment.getId(), assignment.getId(), TenantContext.getTenant());
        return mapPayment(savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeAssignmentResponse> getFeeAssignmentsByStudent(UUID studentId) {
        validateTenantContext();

        if (!studentRepository.existsById(studentId)) {
            throw new IllegalArgumentException("Student not found: " + studentId);
        }

        return feeAssignmentRepository.findAllByStudentId(studentId).stream()
                .map(assignment -> mapAssignment(assignment, getTotalPaidAmount(assignment.getId())))
                .toList();
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-Slug header is required for fee operations");
        }
    }

    private BigDecimal getTotalPaidAmount(UUID assignmentId) {
        return feePaymentRepository.findAllByFeeAssignmentId(assignmentId).stream()
                .map(FeePayment::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private FeeAssignmentResponse mapAssignment(FeeAssignment assignment, BigDecimal paidAmount) {
        BigDecimal dueAmount = assignment.getAmount().subtract(paidAmount);
        return new FeeAssignmentResponse(
                assignment.getId(),
                assignment.getStudentId(),
                assignment.getFeeTitle(),
                assignment.getAmount(),
                paidAmount,
                dueAmount,
                assignment.getDueDate(),
                assignment.getStatus(),
                assignment.getCreatedAt()
        );
    }

    private FeePaymentResponse mapPayment(FeePayment payment) {
        return new FeePaymentResponse(
                payment.getId(),
                payment.getFeeAssignment().getId(),
                payment.getAmountPaid(),
                payment.getPaymentDate(),
                payment.getPaymentMethod(),
                payment.getReferenceNo(),
                payment.getReceivedByUserId(),
                payment.getCreatedAt()
        );
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private UUID requireCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CloudCampusUserDetails principal)
                || principal.getUserId() == null) {
            throw new IllegalStateException("Authenticated user id is required to record fee payment");
        }
        return principal.getUserId();
    }
}
