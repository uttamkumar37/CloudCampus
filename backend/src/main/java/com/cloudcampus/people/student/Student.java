package com.cloudcampus.people.student;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.cloudcampus.academic.ClassLevel;
import com.cloudcampus.academic.Section;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "students",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_students_school_admission_number",
                columnNames = {"school_id", "admission_number"}
        )
)
public class Student {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false, length = 80)
    private String admissionNumber;

    @Column(nullable = false, length = 180)
    private String fullName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_level_id")
    private ClassLevel classLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Column(length = 40)
    private String rollNumber;

    private LocalDate dateOfBirth;

    @Column(length = 40)
    private String gender;

    @Column(length = 180)
    private String guardianName;

    @Column(length = 180)
    private String guardianEmail;

    @Column(length = 40)
    private String guardianMobile;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant importedAt;

    protected Student() {
    }

    public Student(Tenant tenant, School school, String admissionNumber, String fullName) {
        this.tenant = tenant;
        this.school = school;
        this.admissionNumber = admissionNumber;
        this.fullName = fullName;
    }

    public Student(
            Tenant tenant,
            School school,
            String admissionNumber,
            String fullName,
            ClassLevel classLevel,
            Section section,
            String rollNumber,
            LocalDate dateOfBirth,
            String gender,
            String guardianName,
            String guardianEmail,
            String guardianMobile,
            Instant importedAt
    ) {
        this(tenant, school, admissionNumber, fullName);
        this.classLevel = classLevel;
        this.section = section;
        this.rollNumber = rollNumber;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.guardianName = guardianName;
        this.guardianEmail = guardianEmail;
        this.guardianMobile = guardianMobile;
        this.importedAt = importedAt;
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

    public String getAdmissionNumber() {
        return admissionNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public ClassLevel getClassLevel() {
        return classLevel;
    }

    public Section getSection() {
        return section;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public String getGuardianName() {
        return guardianName;
    }

    public String getGuardianEmail() {
        return guardianEmail;
    }

    public String getGuardianMobile() {
        return guardianMobile;
    }

    public boolean isActive() {
        return active;
    }

    public Instant getImportedAt() {
        return importedAt;
    }

    public UserAccount getUser() {
        return user;
    }

    public void attachUser(UserAccount user) {
        this.user = user;
    }
}
