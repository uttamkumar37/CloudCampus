package com.cloudcampus.attendance.service;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Fires parent absence alerts when a student is marked ABSENT (CC-0803).
 * Implementations must be async / fire-and-forget.
 */
public interface AttendanceAlertService {

    /**
     * Look up all parents linked to {@code studentId} and queue an
     * ATTENDANCE_ALERT email for each via the durable notification queue.
     * Must not throw — failures are logged but must not break the caller's transaction.
     */
    void alertParentsAsync(UUID tenantId, UUID schoolId, UUID studentId, LocalDate sessionDate);
}
