package com.cloudcampus.student.profile.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_identity_profiles")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class StudentIdentityProfile {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(name = "government_id_type")
    private String governmentIdType;

    @Column(name = "government_id_number")
    private String governmentIdNumber;

    private String nationality;
    private String religion;

    @Column(name = "caste_category")
    private String casteCategory;

    @Column(name = "mother_tongue")
    private String motherTongue;

    @Column(name = "previous_school")
    private String previousSchool;

    @Column(name = "enrollment_source")
    private String enrollmentSource;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected StudentIdentityProfile() {}

    public static StudentIdentityProfile create(UUID tenantId, UUID schoolId, UUID studentId) {
        StudentIdentityProfile p = new StudentIdentityProfile();
        p.tenantId = tenantId;
        p.schoolId = schoolId;
        p.studentId = studentId;
        return p;
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public UUID getSchoolId() { return schoolId; }
    public UUID getStudentId() { return studentId; }
    public String getGovernmentIdType() { return governmentIdType; }
    public String getGovernmentIdNumber() { return governmentIdNumber; }
    public String getNationality() { return nationality; }
    public String getReligion() { return religion; }
    public String getCasteCategory() { return casteCategory; }
    public String getMotherTongue() { return motherTongue; }
    public String getPreviousSchool() { return previousSchool; }
    public String getEnrollmentSource() { return enrollmentSource; }
    public String getEmergencyContactName() { return emergencyContactName; }
    public String getEmergencyContactPhone() { return emergencyContactPhone; }

    public void setGovernmentIdType(String governmentIdType) { this.governmentIdType = governmentIdType; }
    public void setGovernmentIdNumber(String governmentIdNumber) { this.governmentIdNumber = governmentIdNumber; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    public void setReligion(String religion) { this.religion = religion; }
    public void setCasteCategory(String casteCategory) { this.casteCategory = casteCategory; }
    public void setMotherTongue(String motherTongue) { this.motherTongue = motherTongue; }
    public void setPreviousSchool(String previousSchool) { this.previousSchool = previousSchool; }
    public void setEnrollmentSource(String enrollmentSource) { this.enrollmentSource = enrollmentSource; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }
}
