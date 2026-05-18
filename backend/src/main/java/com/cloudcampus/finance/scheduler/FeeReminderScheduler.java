package com.cloudcampus.finance.scheduler;

import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.finance.entity.FeeStatus;
import com.cloudcampus.finance.entity.StudentFeeRecord;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import com.cloudcampus.notification.entity.NotificationTemplateCode;
import com.cloudcampus.notification.queue.NotificationQueuePublisher;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.repository.StudentParentLinkRepository;
import com.cloudcampus.student.repository.StudentRepository;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Daily fee reminder job (CC-0903).
 *
 * Runs at 08:00 UTC and sends a FEE_REMINDER email to every parent linked to
 * a student whose fee is due within the next 3 days or was due yesterday.
 * Covers PENDING, PARTIAL, and OVERDUE records only — PAID and WAIVED are skipped.
 */
@Component
class FeeReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(FeeReminderScheduler.class);

    private static final List<FeeStatus> ACTIONABLE =
            List.of(FeeStatus.PENDING, FeeStatus.PARTIAL, FeeStatus.OVERDUE);

    private final StudentFeeRecordRepository feeRepo;
    private final StudentRepository          studentRepo;
    private final StudentParentLinkRepository linkRepo;
    private final UserRepository             userRepo;
    private final SchoolRepository           schoolRepo;
    private final NotificationQueuePublisher publisher;

    FeeReminderScheduler(
            StudentFeeRecordRepository feeRepo,
            StudentRepository          studentRepo,
            StudentParentLinkRepository linkRepo,
            UserRepository             userRepo,
            SchoolRepository           schoolRepo,
            NotificationQueuePublisher publisher) {
        this.feeRepo     = feeRepo;
        this.studentRepo = studentRepo;
        this.linkRepo    = linkRepo;
        this.userRepo    = userRepo;
        this.schoolRepo  = schoolRepo;
        this.publisher   = publisher;
    }

    @Scheduled(cron = "0 0 8 * * *", zone = "UTC")
    @SchedulerLock(name = "FeeReminderScheduler_sendReminders", lockAtMostFor = "PT30M", lockAtLeastFor = "PT5M")
    @Transactional(readOnly = true)
    public void sendReminders() {
        LocalDate today = LocalDate.now();
        LocalDate from  = today.minusDays(1);   // 1 day overdue
        LocalDate to    = today.plusDays(3);    // up to 3 days upcoming

        List<StudentFeeRecord> records = feeRepo.findByStatusInAndDueDateBetween(ACTIONABLE, from, to);
        log.info("Fee reminder job: {} actionable records in window [{}, {}]", records.size(), from, to);

        int sent = 0;
        for (StudentFeeRecord record : records) {
            try {
                sent += notifyParents(record);
            } catch (Exception ex) {
                log.warn("Fee reminder failed for record={}: {}", record.getId(), ex.getMessage());
            }
        }
        log.info("Fee reminder job complete: {} emails queued", sent);
    }

    private int notifyParents(StudentFeeRecord record) {
        String previousTenant = RequestContext.getTenantId();
        String previousSchool = RequestContext.getSchoolId();
        UUID previousUser = RequestContext.getUserId();
        try {
            RequestContext.setTenantId(record.getTenantId().toString());
            RequestContext.setSchoolId(record.getSchoolId().toString());

            var student = studentRepo.findByIdAndTenantId(record.getStudentId(), record.getTenantId()).orElse(null);
            if (student == null) return 0;

            String schoolName = schoolRepo.findByIdFiltered(record.getSchoolId())
                    .map(s -> s.getName())
                    .orElse("School");

            BigDecimal balance = record.getAmountDue()
                    .subtract(record.getDiscount())
                    .subtract(record.getAmountPaid());

            Map<String, String> vars = Map.of(
                    "studentName", student.getFirstName() + " " + student.getLastName(),
                    "amount",      balance.toPlainString(),
                    "dueDate",     record.getDueDate() != null ? record.getDueDate().toString() : "—",
                    "schoolName",  schoolName
            );

            var links = linkRepo.findAllByStudentIdOrderByIsPrimaryDescCreatedAtAsc(record.getStudentId());
            int count = 0;
            for (var link : links) {
                var user = userRepo.findByIdAndTenantId(link.getParentUserId(), record.getTenantId()).orElse(null);
                if (user == null) continue;
                publisher.publishEmail(
                        record.getTenantId(), record.getSchoolId(),
                        user.getUsername(),
                        NotificationTemplateCode.FEE_REMINDER, vars);
                count++;
            }
            return count;
        } finally {
            restoreContext(previousTenant, previousSchool, previousUser);
        }
    }

    private void restoreContext(String tenantId, String schoolId, UUID userId) {
        RequestContext.clearAll();
        if (tenantId != null) RequestContext.setTenantId(tenantId);
        if (schoolId != null) RequestContext.setSchoolId(schoolId);
        if (userId != null) RequestContext.setUserId(userId);
    }
}
