package com.cloudcampus.people.staff;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "staff_profiles",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_staff_profiles_school_user", columnNames = {"school_id", "user_id"}),
                @UniqueConstraint(name = "uk_staff_profiles_school_employee", columnNames = {"school_id", "employee_number"})
        }
)
public class StaffProfile {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private UserRole role;

    @Column(length = 80)
    private String employeeNumber;

    @Column(nullable = false, length = 180)
    private String fullName;

    @Column(nullable = false, length = 320)
    private String email;

    @Column(length = 120)
    private String department;

    @Column(length = 120)
    private String designation;

    @Column(nullable = false)
    private boolean portalLoginRequired;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Instant createdAt;

    protected StaffProfile() {
    }

    public StaffProfile(
            Tenant tenant,
            School school,
            UserAccount user,
            UserRole role,
            String employeeNumber,
            String fullName,
            String email,
            String department,
            String designation,
            boolean portalLoginRequired
    ) {
        this.tenant = tenant;
        this.school = school;
        this.user = user;
        this.role = role;
        this.employeeNumber = employeeNumber;
        this.fullName = fullName;
        this.email = email;
        this.department = department;
        this.designation = designation;
        this.portalLoginRequired = portalLoginRequired;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public String getId() {
        return id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public School getSchool() {
        return school;
    }

    public UserAccount getUser() {
        return user;
    }

    public UserRole getRole() {
        return role;
    }

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getDepartment() {
        return department;
    }

    public String getDesignation() {
        return designation;
    }

    public boolean isPortalLoginRequired() {
        return portalLoginRequired;
    }

    public boolean isActive() {
        return active;
    }
}
