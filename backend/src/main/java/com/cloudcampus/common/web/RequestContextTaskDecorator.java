package com.cloudcampus.common.web;

import org.springframework.core.task.TaskDecorator;

import java.util.UUID;

/**
 * Propagates {@link RequestContext} (tenantId, schoolId, userId) from the
 * calling thread into the async worker thread (CRIT-10).
 *
 * ThreadLocal values are not inherited by thread-pool threads. Without this
 * decorator, any @Async method that reads RequestContext gets null values,
 * breaking tenant isolation in audit logging, notification dispatch, and any
 * other fire-and-forget operation that needs the request context.
 *
 * Applied to all ThreadPoolTaskExecutors in {@link com.cloudcampus.config.AsyncConfig}.
 * The finally block always clears context from the pool thread to prevent leakage
 * between tasks sharing the same worker thread.
 */
public class RequestContextTaskDecorator implements TaskDecorator {

    @Override
    public Runnable decorate(Runnable runnable) {
        // Capture on the submitting (HTTP request) thread before handing off.
        String tenantId = RequestContext.getTenantId();
        String schoolId = RequestContext.getSchoolId();
        UUID   userId   = RequestContext.getUserId();

        return () -> {
            try {
                RequestContext.setTenantId(tenantId);
                RequestContext.setSchoolId(schoolId);
                RequestContext.setUserId(userId);
                runnable.run();
            } finally {
                // Prevent stale context leaking to the next task on this pool thread.
                RequestContext.clearAll();
            }
        };
    }
}
