package com.cloudcampus.platform.superadmin.stats;

import java.time.Instant;

import com.cloudcampus.platform.tenant.Tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "tenant_stats")
public class TenantStats implements Persistable<String> {

    @Id
    @Column(name = "tenant_id", length = 36)
    private String tenantId;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    private long schoolCount;
    private long activeSchoolCount;
    private long studentCount;
    private long activeStudentCount;
    private long staffCount;
    private long activeStaffCount;
    private long userCount;
    private long activeUserCount;

    @Column(nullable = false)
    private Instant updatedAt;

    @Transient
    private boolean newEntity;

    protected TenantStats() {
    }

    public TenantStats(Tenant tenant) {
        this.tenant = tenant;
        this.tenantId = tenant.getId();
        this.newEntity = true;
    }

    public void update(
            long schoolCount,
            long activeSchoolCount,
            long studentCount,
            long activeStudentCount,
            long staffCount,
            long activeStaffCount,
            long userCount,
            long activeUserCount,
            Instant updatedAt
    ) {
        this.schoolCount = schoolCount;
        this.activeSchoolCount = activeSchoolCount;
        this.studentCount = studentCount;
        this.activeStudentCount = activeStudentCount;
        this.staffCount = staffCount;
        this.activeStaffCount = activeStaffCount;
        this.userCount = userCount;
        this.activeUserCount = activeUserCount;
        this.updatedAt = updatedAt;
    }

    public String getTenantId() {
        return tenantId;
    }

    @Override
    public String getId() {
        return tenantId;
    }

    @Override
    public boolean isNew() {
        return newEntity;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.newEntity = false;
    }

    public long getSchoolCount() {
        return schoolCount;
    }

    public long getActiveSchoolCount() {
        return activeSchoolCount;
    }

    public long getStudentCount() {
        return studentCount;
    }

    public long getActiveStudentCount() {
        return activeStudentCount;
    }

    public long getStaffCount() {
        return staffCount;
    }

    public long getActiveStaffCount() {
        return activeStaffCount;
    }

    public long getUserCount() {
        return userCount;
    }

    public long getActiveUserCount() {
        return activeUserCount;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
