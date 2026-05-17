package com.cloudcampus.retention;

import com.cloudcampus.audit.service.AuditLogService;
import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.common.retention.RetentionProperties;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Nightly data-retention purge (CC-1806 — GDPR/PDPA compliance).
 *
 * Runs at 02:00 UTC every day and physically removes user rows that have been
 * soft-deleted for longer than {@code app.retention.soft-delete-retention-days}.
 *
 * Only the {@code users} table uses soft-delete today. Other tables (students,
 * staff) use hard-delete directly; their records are retained via FK relationships
 * (audit logs, attendance records) and the school's own data-export tools.
 *
 * If {@code softDeleteRetentionDays == 0} the job is a no-op — use this to
 * disable physical purge without removing the scheduler.
 */
@Service
public class DataRetentionService {

    private static final Logger log = LoggerFactory.getLogger(DataRetentionService.class);

    private final RetentionProperties  props;
    private final UserRepository       userRepository;
    private final AuditLogService      auditLogService;

    DataRetentionService(RetentionProperties props,
                         UserRepository userRepository,
                         AuditLogService auditLogService) {
        this.props           = props;
        this.userRepository  = userRepository;
        this.auditLogService = auditLogService;
    }

    @Scheduled(cron = "0 0 2 * * *", zone = "UTC")
    @SchedulerLock(name = "DataRetentionService_purge", lockAtMostFor = "PT30M", lockAtLeastFor = "PT5M")
    @Transactional
    public void purgeExpiredSoftDeletedUsers() {
        int days = props.softDeleteRetentionDays();
        if (days == 0) {
            log.debug("Data retention purge skipped — softDeleteRetentionDays is 0");
            return;
        }

        Instant cutoff = Instant.now().minus(days, ChronoUnit.DAYS);
        int purged = userRepository.hardDeleteExpiredUsers(cutoff);

        if (purged > 0) {
            log.info("Data retention purge: hard-deleted {} user row(s) soft-deleted for >{} days",
                    purged, days);
            auditLogService.logDataPurge(purged, days);
        } else {
            log.debug("Data retention purge: no expired soft-deleted user rows found (cutoff={})", cutoff);
        }
    }
}
