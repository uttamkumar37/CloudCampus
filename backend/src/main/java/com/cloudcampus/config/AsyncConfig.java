package com.cloudcampus.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
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
public class AsyncConfig {

    private static final Logger log = LoggerFactory.getLogger(AsyncConfig.class);

    @Bean(name = "auditExecutor")
    public Executor auditExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("audit-");
        // CallerRunsPolicy: if the queue is full, the calling thread executes the task.
        // This prevents silent audit loss under burst load. The slight latency spike
        // is acceptable — it's better than dropping audit records.
        executor.setRejectedExecutionHandler((r, exec) -> {
            log.warn("Audit executor queue full — running task on caller thread");
            r.run();
        });
        executor.initialize();
        return executor;
    }
}
