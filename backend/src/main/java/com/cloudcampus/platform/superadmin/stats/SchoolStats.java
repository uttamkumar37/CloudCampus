package com.cloudcampus.platform.superadmin.stats;

import java.time.Instant;

import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "school_stats")
public class SchoolStats implements Persistable<String> {

    @Id
    @Column(name = "school_id", length = 36)
    private String schoolId;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "school_id")
    private School school;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    private long studentCount;
    private long activeStudentCount;
    private long staffCount;
    private long activeStaffCount;
    private Instant lastActivityAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Transient
    private boolean newEntity;

    protected SchoolStats() {
    }

    public SchoolStats(School school) {
        this.school = school;
        this.schoolId = school.getId();
        this.tenant = school.getTenant();
        this.newEntity = true;
    }

    public void update(
            long studentCount,
            long activeStudentCount,
            long staffCount,
            long activeStaffCount,
            Instant lastActivityAt,
            Instant updatedAt
    ) {
        this.studentCount = studentCount;
        this.activeStudentCount = activeStudentCount;
        this.staffCount = staffCount;
        this.activeStaffCount = activeStaffCount;
        this.lastActivityAt = lastActivityAt;
        this.updatedAt = updatedAt;
    }

    public String getSchoolId() {
        return schoolId;
    }

    @Override
    public String getId() {
        return schoolId;
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

    public Instant getLastActivityAt() {
        return lastActivityAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
