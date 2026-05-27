package com.cloudcampus.operations.finance;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.people.parent.ParentStudentLinkRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeeService {

    private final FeeDemandRepository feeDemandRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final StudentRepository studentRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;

    public FeeService(
            FeeDemandRepository feeDemandRepository,
            FeePaymentRepository feePaymentRepository,
            StudentRepository studentRepository,
            ParentStudentLinkRepository parentStudentLinkRepository,
            SchoolRepository schoolRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService
    ) {
        this.feeDemandRepository = feeDemandRepository;
        this.feePaymentRepository = feePaymentRepository;
        this.studentRepository = studentRepository;
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.schoolRepository = schoolRepository;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public FeeDemandResponse createDemand(AuthenticatedUser actor, FeeDemandRequest request) {
        School school = requireActiveFinanceSchool(actor);
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new NotFoundException("Student was not found."));
        requireStudentInSchool(student, school.getId());

        FeeDemand demand = feeDemandRepository.save(new FeeDemand(
                school.getTenant(),
                school,
                student,
                request.description().trim(),
                money(request.amount()),
                request.dueDate()
        ));
        recordDemandCreated(actor.user(), demand);
        return toResponse(demand);
    }

    @Transactional(readOnly = true)
    public List<FeeDemandResponse> schoolDemands(AuthenticatedUser actor) {
        School school = requireActiveFinanceSchool(actor);
        return feeDemandRepository.findBySchoolIdOrderByDueDateAscCreatedAtAsc(school.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FeeDemandResponse schoolDemand(AuthenticatedUser actor, String demandId) {
        FeeDemand demand = requireDemand(demandId);
        schoolAccessService.requireSchoolFinanceAccess(actor.user().getId(), demand.getSchool().getId());
        return toResponse(demand);
    }

    @Transactional
    public FeeDemandResponse recordSchoolPayment(AuthenticatedUser actor, String demandId, FeePaymentRequest request) {
        FeeDemand demand = requireDemand(demandId);
        schoolAccessService.requireSchoolFinanceAccess(actor.user().getId(), demand.getSchool().getId());
        recordPayment(actor.user(), demand, request);
        return toResponse(demand);
    }

    @Transactional(readOnly = true)
    public List<FeeDemandResponse> parentChildFees(AuthenticatedUser actor, String studentId) {
        requireParentLinkedToStudent(actor, studentId);
        return feeDemandRepository.findByStudentIdOrderByDueDateAscCreatedAtAsc(studentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public FeeDemandResponse recordParentPayment(
            AuthenticatedUser actor,
            String studentId,
            String demandId,
            FeePaymentRequest request
    ) {
        requireParentLinkedToStudent(actor, studentId);
        FeeDemand demand = requireDemand(demandId);
        requireDemandForStudent(demand, studentId);
        recordPayment(actor.user(), demand, request);
        return toResponse(demand);
    }

    @Transactional(readOnly = true)
    public List<FeeDemandResponse> studentFees(AuthenticatedUser actor) {
        Student student = requireStudentProfile(actor);
        return feeDemandRepository.findByStudentIdOrderByDueDateAscCreatedAtAsc(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private FeePayment recordPayment(UserAccount actor, FeeDemand demand, FeePaymentRequest request) {
        BigDecimal amount = money(request.amount());
        if (demand.getStatus() == FeeDemandStatus.PAID) {
            throw new BadRequestException("Fee demand is already paid.");
        }
        if (amount.compareTo(demand.outstandingAmount()) > 0) {
            throw new BadRequestException("Payment amount cannot exceed outstanding demand amount.");
        }

        demand.recordPayment(amount);
        FeePayment payment = feePaymentRepository.save(new FeePayment(
                demand.getTenant(),
                demand.getSchool(),
                demand,
                demand.getStudent(),
                actor,
                amount,
                normalizeMethod(request.paymentMethod()),
                normalizeOptional(request.paymentReference()),
                receiptNumber(demand),
                Instant.now()
        ));
        recordPaymentRecorded(actor, payment);
        recordReceiptIssued(actor, payment);
        return payment;
    }

    private School requireActiveFinanceSchool(AuthenticatedUser actor) {
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolFinanceAccess(actor.user().getId(), activeSchoolId);
        return schoolRepository.findById(activeSchoolId)
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private void requireStudentInSchool(Student student, String schoolId) {
        if (!student.getSchool().getId().equals(schoolId)) {
            throw new ForbiddenException("Student does not belong to the active school.");
        }
    }

    private void requireDemandForStudent(FeeDemand demand, String studentId) {
        if (!demand.getStudent().getId().equals(studentId)) {
            throw new ForbiddenException("Fee demand does not belong to this student.");
        }
    }

    private void requireParentLinkedToStudent(AuthenticatedUser actor, String studentId) {
        if (actor.user().getRole() != UserRole.PARENT) {
            throw new ForbiddenException("Parent access is required.");
        }
        parentStudentLinkRepository.findByParentUserIdAndStudentId(actor.user().getId(), studentId)
                .filter(link -> link.getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(link -> link.getStudent().getTenant().getId().equals(actor.user().getTenant().getId()))
                .orElseThrow(() -> new ForbiddenException("Parent is not linked to this child."));
    }

    private Student requireStudentProfile(AuthenticatedUser actor) {
        if (actor.user().getRole() != UserRole.STUDENT) {
            throw new ForbiddenException("Student access is required.");
        }
        return studentRepository.findByUserId(actor.user().getId())
                .filter(student -> student.getTenant().getId().equals(actor.user().getTenant().getId()))
                .orElseThrow(() -> new ForbiddenException("Student profile is not linked to this user."));
    }

    private FeeDemand requireDemand(String demandId) {
        return feeDemandRepository.findById(demandId)
                .orElseThrow(() -> new NotFoundException("Fee demand was not found."));
    }

    private FeeDemandResponse toResponse(FeeDemand demand) {
        return new FeeDemandResponse(
                demand.getId(),
                demand.getTenant().getId(),
                demand.getSchool().getId(),
                demand.getStudent().getId(),
                demand.getStudent().getFullName(),
                demand.getStudent().getAdmissionNumber(),
                demand.getDescription(),
                demand.getAmountDue(),
                demand.getAmountPaid(),
                demand.outstandingAmount(),
                demand.getDueDate(),
                demand.getStatus(),
                demand.getCreatedAt(),
                feePaymentRepository.findByDemandIdOrderByPaidAtAsc(demand.getId())
                        .stream()
                        .map(this::toPaymentResponse)
                        .toList()
        );
    }

    private FeePaymentResponse toPaymentResponse(FeePayment payment) {
        return new FeePaymentResponse(
                payment.getId(),
                payment.getTenant().getId(),
                payment.getSchool().getId(),
                payment.getDemand().getId(),
                payment.getStudent().getId(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getPaymentReference(),
                payment.getReceiptNumber(),
                payment.getPaidAt()
        );
    }

    private void recordDemandCreated(UserAccount actor, FeeDemand demand) {
        auditLogService.record(
                demand.getTenant().getId(),
                demand.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.FEE_DEMAND_CREATED,
                "FeeDemand",
                demand.getId(),
                "Fee demand created.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", demand.getTenant().getId(),
                        "schoolId", demand.getSchool().getId(),
                        "studentId", demand.getStudent().getId(),
                        "demandId", demand.getId(),
                        "amountDue", demand.getAmountDue()
                )
        );
    }

    private void recordPaymentRecorded(UserAccount actor, FeePayment payment) {
        auditLogService.record(
                payment.getTenant().getId(),
                payment.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.FEE_PAYMENT_RECORDED,
                "FeePayment",
                payment.getId(),
                "Fee payment recorded.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", payment.getTenant().getId(),
                        "schoolId", payment.getSchool().getId(),
                        "studentId", payment.getStudent().getId(),
                        "demandId", payment.getDemand().getId(),
                        "paymentId", payment.getId(),
                        "amount", payment.getAmount(),
                        "paymentMethod", payment.getPaymentMethod()
                )
        );
    }

    private void recordReceiptIssued(UserAccount actor, FeePayment payment) {
        auditLogService.record(
                payment.getTenant().getId(),
                payment.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.RECEIPT_ISSUED,
                "FeePayment",
                payment.getId(),
                "Fee receipt issued.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", payment.getTenant().getId(),
                        "schoolId", payment.getSchool().getId(),
                        "studentId", payment.getStudent().getId(),
                        "demandId", payment.getDemand().getId(),
                        "paymentId", payment.getId(),
                        "receiptNumber", payment.getReceiptNumber()
                )
        );
    }

    private String receiptNumber(FeeDemand demand) {
        return "RCPT-" + demand.getSchool().getCode().toUpperCase(Locale.ROOT) + "-" + System.nanoTime();
    }

    private BigDecimal money(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    private String normalizeMethod(String value) {
        return value.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
