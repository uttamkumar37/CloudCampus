package com.cloudcampus.portal.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.cloudcampus.academic.TeacherAssignmentRepository;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.events.outbox.OutboxEventRepository;
import com.cloudcampus.events.outbox.OutboxEventStatus;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.notification.NotificationDeliveryRepository;
import com.cloudcampus.notification.NotificationDeliveryStatus;
import com.cloudcampus.operations.bulk.BulkJobStatus;
import com.cloudcampus.operations.attendance.AttendanceSessionRepository;
import com.cloudcampus.operations.exam.Exam;
import com.cloudcampus.operations.exam.ExamRepository;
import com.cloudcampus.operations.exam.ExamResultRepository;
import com.cloudcampus.operations.finance.FeeDemand;
import com.cloudcampus.operations.finance.FeeDemandRepository;
import com.cloudcampus.operations.finance.FeePaymentRepository;
import com.cloudcampus.operations.homework.Homework;
import com.cloudcampus.operations.homework.HomeworkRepository;
import com.cloudcampus.operations.notice.Notice;
import com.cloudcampus.operations.notice.NoticeRepository;
import com.cloudcampus.operations.report.ReportExportJobRepository;
import com.cloudcampus.people.parent.ParentLeaveRequestRepository;
import com.cloudcampus.people.parent.ParentStudentLink;
import com.cloudcampus.people.parent.ParentStudentLinkRepository;
import com.cloudcampus.people.staff.StaffProfileRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.platform.subscription.TenantInvoice;
import com.cloudcampus.platform.subscription.TenantInvoiceRepository;
import com.cloudcampus.platform.subscription.TenantInvoiceStatus;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardSummaryService {

    private final TenantRepository tenantRepository;
    private final SchoolRepository schoolRepository;
    private final UserAccountRepository userAccountRepository;
    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final StudentRepository studentRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final ParentLeaveRequestRepository parentLeaveRequestRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final HomeworkRepository homeworkRepository;
    private final ExamRepository examRepository;
    private final ExamResultRepository examResultRepository;
    private final FeeDemandRepository feeDemandRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final NoticeRepository noticeRepository;
    private final ReportExportJobRepository reportExportJobRepository;
    private final TenantInvoiceRepository tenantInvoiceRepository;
    private final NotificationDeliveryRepository notificationDeliveryRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardSummaryService(
            TenantRepository tenantRepository,
            SchoolRepository schoolRepository,
            UserAccountRepository userAccountRepository,
            UserSchoolAccessRepository userSchoolAccessRepository,
            StudentRepository studentRepository,
            StaffProfileRepository staffProfileRepository,
            ParentStudentLinkRepository parentStudentLinkRepository,
            ParentLeaveRequestRepository parentLeaveRequestRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            AttendanceSessionRepository attendanceSessionRepository,
            HomeworkRepository homeworkRepository,
            ExamRepository examRepository,
            ExamResultRepository examResultRepository,
            FeeDemandRepository feeDemandRepository,
            FeePaymentRepository feePaymentRepository,
            NoticeRepository noticeRepository,
            ReportExportJobRepository reportExportJobRepository,
            TenantInvoiceRepository tenantInvoiceRepository,
            NotificationDeliveryRepository notificationDeliveryRepository,
            OutboxEventRepository outboxEventRepository,
            AuditLogRepository auditLogRepository
    ) {
        this.tenantRepository = tenantRepository;
        this.schoolRepository = schoolRepository;
        this.userAccountRepository = userAccountRepository;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.studentRepository = studentRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.parentLeaveRequestRepository = parentLeaveRequestRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.attendanceSessionRepository = attendanceSessionRepository;
        this.homeworkRepository = homeworkRepository;
        this.examRepository = examRepository;
        this.examResultRepository = examResultRepository;
        this.feeDemandRepository = feeDemandRepository;
        this.feePaymentRepository = feePaymentRepository;
        this.noticeRepository = noticeRepository;
        this.reportExportJobRepository = reportExportJobRepository;
        this.tenantInvoiceRepository = tenantInvoiceRepository;
        this.notificationDeliveryRepository = notificationDeliveryRepository;
        this.outboxEventRepository = outboxEventRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse superAdmin(AuthenticatedUser actor) {
        requireRole(actor, UserRole.SUPER_ADMIN);
        long overdueInvoices = tenantInvoiceRepository.findAll().stream()
                .filter(invoice -> invoice.getStatus() == TenantInvoiceStatus.OVERDUE
                        || (invoice.getStatus() == TenantInvoiceStatus.ISSUED
                        && invoice.getDueAt() != null
                        && invoice.getDueAt().isBefore(java.time.Instant.now())))
                .count();
        long pendingReports = reportExportJobRepository.findTop10ByOrderByRequestedAtDesc().stream()
                .filter(job -> job.getBulkJob().getStatus() == BulkJobStatus.QUEUED
                        || job.getBulkJob().getStatus() == BulkJobStatus.VALIDATING
                        || job.getBulkJob().getStatus() == BulkJobStatus.PROCESSING)
                .count();
        List<DashboardItemResponse> alerts = new ArrayList<>();
        long pendingOutbox = outboxEventRepository.findTop100ByStatusOrderByCreatedAtAsc(OutboxEventStatus.PENDING).size();
        long failedNotifications = notificationDeliveryRepository.countByStatus(NotificationDeliveryStatus.FAILED);
        if (pendingOutbox > 0) {
            alerts.add(item("Pending outbox", pendingOutbox + " platform events are waiting for delivery.", java.time.Instant.now()));
        }
        if (failedNotifications > 0) {
            alerts.add(item("Failed notifications", failedNotifications + " deliveries need review.", java.time.Instant.now()));
        }
        if (overdueInvoices > 0) {
            alerts.add(item("Overdue invoices", overdueInvoices + " invoices are past due.", java.time.Instant.now()));
        }
        if (pendingReports > 0) {
            alerts.add(item("Report export queue", pendingReports + " report exports are queued or processing.", java.time.Instant.now()));
        }
        List<DashboardItemResponse> activity = auditLogRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(log -> item(log.getAction().name(), log.getSummary(), log.getCreatedAt()))
                .toList();
        return new DashboardSummaryResponse(
                List.of(
                        metric("Total tenants", tenantRepository.count(), "All platform tenants"),
                        metric("Active tenants", tenantRepository.findAll().stream().filter(tenant -> tenant.getStatus().name().equals("ACTIVE")).count(), "Tenants currently active"),
                        metric("Total schools", schoolRepository.count(), "All onboarded schools"),
                        metric("Active schools", schoolRepository.countByActiveTrue(), "Platform schools currently active"),
                        metric("Total users", userAccountRepository.count(), "All platform user accounts"),
                        metric("Students", studentRepository.count(), "All student records"),
                        metric("Staff", staffProfileRepository.count(), "All staff profiles"),
                        metric("Paid invoices", tenantInvoiceRepository.countByStatus(TenantInvoiceStatus.PAID), "Invoices marked paid")
                ),
                alerts,
                activity
        );
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse tenantAdmin(AuthenticatedUser actor) {
        requireRole(actor, UserRole.TENANT_ADMIN);
        String tenantId = actor.user().getTenant().getId();
        return response(List.of(
                metric("Active schools", schoolRepository.countByTenantIdAndActiveTrue(tenantId), "Tenant schools online"),
                metric("Total schools", schoolRepository.countByTenantId(tenantId), "Configured tenant schools"),
                metric("Students", studentRepository.countByTenantId(tenantId), "Imported student records"),
                metric("Staff profiles", staffProfileRepository.countByTenantId(tenantId), "Teacher, finance and staff profiles"),
                metric("School admins", userAccountRepository.countByTenantIdAndRole(tenantId, UserRole.SCHOOL_ADMIN), "Tenant School Admin users")
        ));
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse schoolAdmin(AuthenticatedUser actor) {
        requireAnyRole(actor, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL);
        String schoolId = requireActiveSchoolLeadership(actor);
        return schoolScopedSummary(schoolId);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse teacher(AuthenticatedUser actor) {
        requireRole(actor, UserRole.TEACHER);
        String schoolId = requireActiveTeacherSchool(actor);
        long assignments = teacherAssignmentRepository.findByTeacherIdOrderByClassSubjectAssignmentClassLevelNameAscClassSubjectAssignmentSubjectNameAsc(
                actor.user().getId()
        ).stream()
                .filter(assignment -> assignment.isActive()
                        && assignment.getSchool().getId().equals(schoolId))
                .count();
        List<Homework> homework = homeworkRepository.findBySchoolIdOrderByDueDateAscCreatedAtAsc(schoolId)
                .stream()
                .filter(item -> item.getCreatedByUser().getId().equals(actor.user().getId()))
                .toList();
        List<Exam> exams = examRepository.findBySchoolIdOrderByExamDateAscCreatedAtAsc(schoolId)
                .stream()
                .filter(item -> item.getCreatedByUser().getId().equals(actor.user().getId()))
                .toList();
        List<Notice> notices = noticeRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId);
        return response(List.of(
                metric("Assigned classes", assignments, "Teacher assignment records"),
                metric("Homework created", homework.size(), "Teacher-created homework"),
                metric("Upcoming exams", upcomingExams(exams), "Teacher-created exams from today onward"),
                metric("Recent notices", notices.size(), "School notices available")
        ));
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse finance(AuthenticatedUser actor) {
        requireRole(actor, UserRole.FINANCE_STAFF);
        String schoolId = requireActiveSchool(actor);
        return financeSummary(schoolId);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse staff(AuthenticatedUser actor) {
        requireRole(actor, UserRole.STAFF);
        String schoolId = requireActiveSchool(actor);
        return response(List.of(
                metric("Active school", "Selected", "School-scoped staff dashboard"),
                metric("School notices", noticeRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId).size(), "Visible school notices"),
                metric("Report exports", reportExportJobRepository.findBySchoolIdOrderByRequestedAtDesc(schoolId).size(), "Report/export jobs available")
        ));
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse parent(AuthenticatedUser actor) {
        requireRole(actor, UserRole.PARENT);
        String activeSchoolId = requireActiveSchool(actor);
        List<ParentStudentLink> children = parentStudentLinkRepository.findByParentUserId(actor.user().getId())
                .stream()
                .filter(link -> link.getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(link -> link.getStudent().getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(link -> link.getSchool().getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(link -> link.getSchool().getId().equals(activeSchoolId))
                .toList();
        List<FeeDemand> demands = new ArrayList<>();
        long leaveRequests = 0;
        long results = 0;
        long homework = 0;
        for (ParentStudentLink link : children) {
            Student child = link.getStudent();
            demands.addAll(feeDemandRepository.findByStudentIdOrderByDueDateAscCreatedAtAsc(child.getId()));
            leaveRequests += parentLeaveRequestRepository.findByParentUserIdAndStudentIdOrderByCreatedAtDesc(
                    actor.user().getId(),
                    child.getId()
            ).size();
            results += examResultRepository.findByStudentIdAndExamStatusOrderByExamExamDateAsc(child.getId(), com.cloudcampus.operations.exam.ExamStatus.PUBLISHED).size();
            if (child.getClassLevel() != null) {
                homework += homeworkRepository.findVisibleForStudent(
                        child.getSchool().getId(),
                        child.getClassLevel().getId(),
                        child.getSection() == null ? null : child.getSection().getId()
                ).size();
            }
        }
        return response(List.of(
                metric("Linked children", children.size(), "Students linked to this parent"),
                metric("Fee due", money(outstanding(demands)), "Outstanding across linked children"),
                metric("Homework", homework, "Published homework visible to linked children"),
                metric("Results", results, "Published result records"),
                metric("Leave requests", leaveRequests, "Submitted leave requests")
        ));
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse student(AuthenticatedUser actor) {
        requireRole(actor, UserRole.STUDENT);
        Student student = studentRepository.findByUserId(actor.user().getId())
                .filter(candidate -> candidate.getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(candidate -> candidate.getUser() != null && candidate.getUser().getId().equals(actor.user().getId()))
                .orElseThrow(() -> new NotFoundException("Student profile was not found."));
        requireActiveStudentSchool(actor, student);
        List<FeeDemand> demands = feeDemandRepository.findByStudentIdOrderByDueDateAscCreatedAtAsc(student.getId());
        long homework = 0;
        if (student.getClassLevel() != null) {
            homework = homeworkRepository.findVisibleForStudent(
                    student.getSchool().getId(),
                    student.getClassLevel().getId(),
                    student.getSection() == null ? null : student.getSection().getId()
            ).size();
        }
        return response(List.of(
                metric("Profile", student.getFullName(), student.getAdmissionNumber()),
                metric("Homework", homework, "Published assignments"),
                metric("Results", examResultRepository.findByStudentIdAndExamStatusOrderByExamExamDateAsc(student.getId(), com.cloudcampus.operations.exam.ExamStatus.PUBLISHED).size(), "Published results"),
                metric("Fee due", money(outstanding(demands)), "Outstanding student fee demand amount")
        ));
    }

    private void requireActiveStudentSchool(AuthenticatedUser actor, Student student) {
        if (actor.activeSchoolId() == null || actor.activeSchoolId().isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        if (!student.getSchool().getId().equals(actor.activeSchoolId())) {
            throw new ForbiddenException("Student profile is not linked to the active school.");
        }
    }

    private DashboardSummaryResponse schoolScopedSummary(String schoolId) {
        List<FeeDemand> demands = feeDemandRepository.findBySchoolIdOrderByDueDateAscCreatedAtAsc(schoolId);
        List<Exam> exams = examRepository.findBySchoolIdOrderByExamDateAscCreatedAtAsc(schoolId);
        return response(List.of(
                metric("Students", studentRepository.countBySchoolIdAndActiveTrue(schoolId), "Active student records"),
                metric("Teachers", userSchoolAccessRepository.countBySchoolIdAndRole(schoolId, UserRole.TEACHER), "Teacher school access grants"),
                metric("Staff", staffProfileRepository.countBySchoolIdAndActiveTrue(schoolId), "Active staff profiles"),
                metric("Attendance sessions", attendanceSessionRepository.findBySchoolIdOrderByAttendanceDateDescCreatedAtDesc(schoolId).size(), "Recorded attendance sessions"),
                metric("Homework", homeworkRepository.findBySchoolIdOrderByDueDateAscCreatedAtAsc(schoolId).size(), "Published homework records"),
                metric("Upcoming exams", upcomingExams(exams), "Exams from today onward"),
                metric("Fee due", money(outstanding(demands)), "Outstanding fee demand amount"),
                metric("Notices", noticeRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId).size(), "School notice records"),
                metric("Reports", reportExportJobRepository.findBySchoolIdOrderByRequestedAtDesc(schoolId).size(), "Report export jobs")
        ));
    }

    private DashboardSummaryResponse financeSummary(String schoolId) {
        List<FeeDemand> demands = feeDemandRepository.findBySchoolIdOrderByDueDateAscCreatedAtAsc(schoolId);
        BigDecimal collected = demands.stream()
                .map(FeeDemand::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return response(List.of(
                metric("Fee demands", demands.size(), "School fee demand records"),
                metric("Collected", money(collected), "Amount paid against fee demands"),
                metric("Outstanding", money(outstanding(demands)), "Amount still due"),
                metric("Receipts", feePaymentRepository.countBySchoolId(schoolId), "Recorded fee payments")
        ));
    }

    private void requireRole(AuthenticatedUser actor, UserRole role) {
        if (actor.user().getRole() != role) {
            throw new ForbiddenException(role.name() + " access is required.");
        }
    }

    private void requireAnyRole(AuthenticatedUser actor, UserRole first, UserRole second) {
        if (actor.user().getRole() != first && actor.user().getRole() != second) {
            throw new ForbiddenException(first.name() + " or " + second.name() + " access is required.");
        }
    }

    private String requireActiveSchool(AuthenticatedUser actor) {
        if (actor.activeSchoolId() == null || actor.activeSchoolId().isBlank()) {
            throw new ForbiddenException("Active school context is required.");
        }
        return actor.activeSchoolId();
    }

    private String requireActiveSchoolLeadership(AuthenticatedUser actor) {
        String schoolId = requireActiveSchool(actor);
        boolean allowed = userSchoolAccessRepository.findByUserIdAndSchoolId(actor.user().getId(), schoolId)
                .map(access -> access.getRole() == UserRole.SCHOOL_ADMIN || access.getRole() == UserRole.PRINCIPAL)
                .orElse(false);
        if (!allowed) {
            throw new ForbiddenException("School leadership access is required.");
        }
        return schoolId;
    }

    private String requireActiveTeacherSchool(AuthenticatedUser actor) {
        String schoolId = requireActiveSchool(actor);
        boolean allowed = userSchoolAccessRepository.findByUserIdAndSchoolId(actor.user().getId(), schoolId)
                .map(access -> access.getRole() == UserRole.TEACHER)
                .orElse(false);
        if (!allowed) {
            throw new ForbiddenException("Teacher access is required for the active school.");
        }
        return schoolId;
    }

    private DashboardSummaryResponse response(List<DashboardMetricResponse> metrics) {
        return new DashboardSummaryResponse(metrics, List.of(), List.of());
    }

    private DashboardMetricResponse metric(String label, long value, String detail) {
        return metric(label, Long.toString(value), detail);
    }

    private DashboardMetricResponse metric(String label, String value, String detail) {
        return new DashboardMetricResponse(label, value, detail);
    }

    private DashboardItemResponse item(String title, String detail, java.time.Instant occurredAt) {
        return new DashboardItemResponse(title, detail, occurredAt);
    }

    private int upcomingExams(List<Exam> exams) {
        LocalDate today = LocalDate.now();
        return (int) exams.stream()
                .filter(exam -> !exam.getExamDate().isBefore(today))
                .count();
    }

    private BigDecimal outstanding(List<FeeDemand> demands) {
        return demands.stream()
                .map(FeeDemand::outstandingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String money(BigDecimal amount) {
        return amount.stripTrailingZeros().toPlainString();
    }
}
