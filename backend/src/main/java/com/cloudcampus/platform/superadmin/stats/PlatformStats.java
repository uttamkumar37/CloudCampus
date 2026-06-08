package com.cloudcampus.platform.superadmin.stats;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "platform_stats")
public class PlatformStats {

    public static final String PLATFORM_ID = "platform";

    @Id
    @Column(length = 40)
    private String id = PLATFORM_ID;

    private long totalTenantCount;
    private long activeTenantCount;
    private long totalSchoolCount;
    private long activeSchoolCount;
    private long totalStudentCount;
    private long activeStudentCount;
    private long totalStaffCount;
    private long activeStaffCount;
    private long totalUserCount;
    private long activeUserCount;
    private long pendingInvoiceCount;
    private long overdueInvoiceCount;
    private long paidInvoiceCount;
    private long failedNotificationCount;
    private long pendingOutboxCount;
    private long pendingReportExportCount;

    @Column(nullable = false)
    private Instant lastCalculatedAt;

    protected PlatformStats() {
    }

    public PlatformStats(
            long totalTenantCount,
            long activeTenantCount,
            long totalSchoolCount,
            long activeSchoolCount,
            long totalStudentCount,
            long activeStudentCount,
            long totalStaffCount,
            long activeStaffCount,
            long totalUserCount,
            long activeUserCount,
            long pendingInvoiceCount,
            long overdueInvoiceCount,
            long paidInvoiceCount,
            long failedNotificationCount,
            long pendingOutboxCount,
            long pendingReportExportCount,
            Instant lastCalculatedAt
    ) {
        this.id = PLATFORM_ID;
        update(
                totalTenantCount,
                activeTenantCount,
                totalSchoolCount,
                activeSchoolCount,
                totalStudentCount,
                activeStudentCount,
                totalStaffCount,
                activeStaffCount,
                totalUserCount,
                activeUserCount,
                pendingInvoiceCount,
                overdueInvoiceCount,
                paidInvoiceCount,
                failedNotificationCount,
                pendingOutboxCount,
                pendingReportExportCount,
                lastCalculatedAt
        );
    }

    public void update(
            long totalTenantCount,
            long activeTenantCount,
            long totalSchoolCount,
            long activeSchoolCount,
            long totalStudentCount,
            long activeStudentCount,
            long totalStaffCount,
            long activeStaffCount,
            long totalUserCount,
            long activeUserCount,
            long pendingInvoiceCount,
            long overdueInvoiceCount,
            long paidInvoiceCount,
            long failedNotificationCount,
            long pendingOutboxCount,
            long pendingReportExportCount,
            Instant lastCalculatedAt
    ) {
        this.totalTenantCount = totalTenantCount;
        this.activeTenantCount = activeTenantCount;
        this.totalSchoolCount = totalSchoolCount;
        this.activeSchoolCount = activeSchoolCount;
        this.totalStudentCount = totalStudentCount;
        this.activeStudentCount = activeStudentCount;
        this.totalStaffCount = totalStaffCount;
        this.activeStaffCount = activeStaffCount;
        this.totalUserCount = totalUserCount;
        this.activeUserCount = activeUserCount;
        this.pendingInvoiceCount = pendingInvoiceCount;
        this.overdueInvoiceCount = overdueInvoiceCount;
        this.paidInvoiceCount = paidInvoiceCount;
        this.failedNotificationCount = failedNotificationCount;
        this.pendingOutboxCount = pendingOutboxCount;
        this.pendingReportExportCount = pendingReportExportCount;
        this.lastCalculatedAt = lastCalculatedAt;
    }

    public long getTotalTenantCount() {
        return totalTenantCount;
    }

    public long getActiveTenantCount() {
        return activeTenantCount;
    }

    public long getTotalSchoolCount() {
        return totalSchoolCount;
    }

    public long getActiveSchoolCount() {
        return activeSchoolCount;
    }

    public long getTotalStudentCount() {
        return totalStudentCount;
    }

    public long getActiveStudentCount() {
        return activeStudentCount;
    }

    public long getTotalStaffCount() {
        return totalStaffCount;
    }

    public long getActiveStaffCount() {
        return activeStaffCount;
    }

    public long getTotalUserCount() {
        return totalUserCount;
    }

    public long getActiveUserCount() {
        return activeUserCount;
    }

    public long getPendingInvoiceCount() {
        return pendingInvoiceCount;
    }

    public long getOverdueInvoiceCount() {
        return overdueInvoiceCount;
    }

    public long getPaidInvoiceCount() {
        return paidInvoiceCount;
    }

    public long getFailedNotificationCount() {
        return failedNotificationCount;
    }

    public long getPendingOutboxCount() {
        return pendingOutboxCount;
    }

    public long getPendingReportExportCount() {
        return pendingReportExportCount;
    }

    public Instant getLastCalculatedAt() {
        return lastCalculatedAt;
    }
}
