package com.cloudcampus.config;

import com.cloudcampus.common.web.RequestContextTaskDecorator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async task executor configuration.
 *
 * Enables Spring's @Async infrastructure and provides a named executor bean
 * used by AuditLogService (and any other fire-and-forget services).
 *
 * Thread pool sizing:
 *   corePoolSize  4  — always-on threads ready for audit writes.
 *   maxPoolSize   8  — burst capacity (audit writes are fast I/O).
 *   queueCapacity 50 — bounded queue; tasks beyond this limit are rejected
 *                      (CallerRunsPolicy — caller thread writes the log itself
 *                       as a safety net, preventing silent loss).
 *
 * Thread names prefixed "audit-" make them easy to spot in thread dumps.
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {

    private static final Logger log = LoggerFactory.getLogger(AsyncConfig.class);

    @Bean(name = "auditExecutor")
    public Executor auditExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("audit-");
        // Propagate RequestContext (tenantId/schoolId/userId) to async threads (CRIT-10).
        executor.setTaskDecorator(new RequestContextTaskDecorator());
        executor.setRejectedExecutionHandler((r, exec) -> {
            log.warn("Audit executor queue full — running task on caller thread");
            r.run();
        });
        executor.initialize();
        return executor;
    }

    /**
     * Dedicated thread pool for email / SMS dispatch (CC-1002 — E12 baseline).
     *
     * Sizing rationale:
     *   corePoolSize  2  — most schools send a moderate volume; 2 threads handle bursts well.
     *   maxPoolSize   6    — allow burst capacity for fee payment notifications.
     *   queueCapacity 5000 — H-16: bulk fee payment for 2000 students generates 2000 tasks;
     *     a queue of 100 filled instantly, causing CallerRunsPolicy to block 1900 HTTP threads
     *     on synchronous email sends. 5000 absorbs a full school-year fee posting run.
     *
     * CallerRunsPolicy: if even the larger queue fills, the HTTP thread sends synchronously
     * rather than dropping the notification silently.
     */
    @Bean(name = "notificationExecutor")
    public Executor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(6);
        executor.setQueueCapacity(5000);
        executor.setThreadNamePrefix("notification-");
        // Propagate RequestContext (tenantId/schoolId/userId) to async threads (CRIT-10).
        executor.setTaskDecorator(new RequestContextTaskDecorator());
        executor.setRejectedExecutionHandler((r, exec) -> {
            log.warn("Notification executor queue full — running task on caller thread");
            r.run();
        });
        executor.initialize();
        return executor;
    }
}
