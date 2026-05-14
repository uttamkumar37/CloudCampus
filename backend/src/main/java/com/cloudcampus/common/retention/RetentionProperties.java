package com.cloudcampus.common.retention;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Data-retention configuration (CC-1806 — GDPR/PDPA compliance).
 *
 * Bound from {@code app.retention.*}.
 *
 * softDeleteRetentionDays — number of days to keep a soft-deleted user row
 * before the nightly purge physically removes it. Default 90 days.
 *
 * Production guidance:
 *   - Education records: typically retained 5–7 years for regulatory compliance
 *     (check local jurisdiction). This window governs *user/account* records only.
 *   - Set to 0 to disable physical purge (soft-delete only mode).
 */
@ConfigurationProperties(prefix = "app.retention")
public record RetentionProperties(int softDeleteRetentionDays) {

    public RetentionProperties {
        if (softDeleteRetentionDays < 0) {
            throw new IllegalArgumentException("app.retention.soft-delete-retention-days must be >= 0");
        }
    }
}
