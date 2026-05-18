package com.cloudcampus.demo;

import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import static com.cloudcampus.demo.DemoConstants.SCHOOL_ID;
import static com.cloudcampus.demo.DemoConstants.TENANT_ID;

/**
 * Nightly reset for the JNV Lucknow demo tenant.
 *
 * Runs at 02:00 AM server time.  Deletes transient demo data (attendance,
 * marks, lesson plans, homework) and re-seeds via {@link DemoDataSeeder}.
 * Structural data (tenant, school, classes, sections, subjects, users) is
 * preserved to avoid breaking existing JWT sessions.
 *
 * Only active when {@code app.demo.enabled=true}.
 */
@Component
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
public class DemoResetScheduler {

    private static final Logger log = LoggerFactory.getLogger(DemoResetScheduler.class);

    private final JdbcTemplate   jdbc;
    private final DemoDataSeeder seeder;

    public DemoResetScheduler(JdbcTemplate jdbc, DemoDataSeeder seeder) {
        this.jdbc   = jdbc;
        this.seeder = seeder;
    }

    @Scheduled(cron = "0 0 2 * * *")   // 02:00 AM daily
    @SchedulerLock(name = "DemoResetScheduler_reset", lockAtMostFor = "PT30M", lockAtLeastFor = "PT5M")
    @Transactional
    public void reset() {
        log.info("DEMO RESET: starting nightly reset for tenant {}.", TENANT_ID);
        long start = System.currentTimeMillis();

        deleteTransientData();

        // Re-seed students, attendance, exams, lesson plans
        seeder.run(null);  // guard-check will pass (students deleted above)

        log.info("DEMO RESET: completed in {} ms.", System.currentTimeMillis() - start);
    }

    // ── Deletion order respects FK constraints ────────────────────────────────

    private void deleteTransientData() {
        // Marks & results
        jdbc.update("DELETE FROM student_marks   WHERE school_id = ?", SCHOOL_ID);
        jdbc.update("DELETE FROM exam_results    WHERE school_id = ?", SCHOOL_ID);
        jdbc.update("DELETE FROM exam_subjects   WHERE exam_id IN "
                  + "(SELECT id FROM exams WHERE school_id = ?)", SCHOOL_ID);
        jdbc.update("DELETE FROM exams           WHERE school_id = ?", SCHOOL_ID);

        // Attendance
        jdbc.update("DELETE FROM attendance_records WHERE school_id = ?", SCHOOL_ID);
        jdbc.update("DELETE FROM attendance_sessions WHERE school_id = ?", SCHOOL_ID);

        // Lesson plans & homework
        jdbc.update("DELETE FROM lesson_plans          WHERE school_id = ?", SCHOOL_ID);
        jdbc.update("DELETE FROM homework_assignments  WHERE school_id = ?", SCHOOL_ID);
        jdbc.update("DELETE FROM school_notices        WHERE school_id = ?", SCHOOL_ID);

        // Students (bulk-seeded ones; named demo students are preserved by guard)
        jdbc.update("DELETE FROM student_parent_links WHERE tenant_id = ? "
                  + "AND student_id IN (SELECT id FROM students WHERE school_id = ? "
                  + "AND student_number NOT LIKE 'GW-000%')", TENANT_ID, SCHOOL_ID);
        jdbc.update("DELETE FROM students WHERE school_id = ? "
                  + "AND student_number NOT LIKE 'GW-000%'", SCHOOL_ID);

        log.debug("DEMO RESET: transient data deleted.");
    }
}
