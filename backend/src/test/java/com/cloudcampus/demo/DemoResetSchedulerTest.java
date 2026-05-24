package com.cloudcampus.demo;

import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;

import java.lang.reflect.Method;

import static com.cloudcampus.demo.DemoConstants.SCHOOL_ID;
import static com.cloudcampus.demo.DemoConstants.TENANT_ID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;

class DemoResetSchedulerTest {

    @Test
    void resetDeletesFkConstrainedDemoDataBeforeReseeding() throws Exception {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        DemoDataSeeder seeder = mock(DemoDataSeeder.class);
        DemoResetScheduler scheduler = new DemoResetScheduler(jdbc, seeder);

        scheduler.reset();

        InOrder order = inOrder(jdbc, seeder);
        order.verify(jdbc).update("DELETE FROM payment_orders      WHERE school_id = ?", SCHOOL_ID);
        order.verify(jdbc).update("DELETE FROM student_fee_records WHERE school_id = ?", SCHOOL_ID);
        order.verify(jdbc).update("DELETE FROM assignment_submissions WHERE school_id = ?", SCHOOL_ID);
        order.verify(jdbc).update("DELETE FROM assignments            WHERE school_id = ?", SCHOOL_ID);
        order.verify(jdbc).update(
            "DELETE FROM homework_submissions  WHERE tenant_id = ? "
                + "AND homework_id IN (SELECT id FROM homework_assignments WHERE school_id = ?)",
            TENANT_ID,
            SCHOOL_ID);
        order.verify(seeder).run(null);
    }

    @Test
    void resetRunsNightlyAtTwoAm() throws Exception {
        Method reset = DemoResetScheduler.class.getMethod("reset");
        Scheduled scheduled = reset.getAnnotation(Scheduled.class);

        assertThat(scheduled).isNotNull();
        assertThat(scheduled.cron()).isEqualTo("0 0 2 * * *");
    }
}
