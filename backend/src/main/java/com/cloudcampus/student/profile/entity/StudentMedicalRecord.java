package com.cloudcampus.student.profile.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_medical_records")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class StudentMedicalRecord {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(name = "condition_name", nullable = false)
    private String conditionName;

    private String severity;
    private String medication;

    @Column(name = "doctor_contact")
    private String doctorContact;

    private String notes;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected StudentMedicalRecord() {}

    public static StudentMedicalRecord create(UUID tenantId, UUID schoolId, UUID studentId) {
        StudentMedicalRecord r = new StudentMedicalRecord();
        r.tenantId = tenantId;
        r.schoolId = schoolId;
        r.studentId = studentId;
        return r;
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (recordedAt == null) recordedAt = Instant.now();
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getConditionName() { return conditionName; }
    public String getSeverity() { return severity; }
    public String getMedication() { return medication; }
    public String getDoctorContact() { return doctorContact; }
    public String getNotes() { return notes; }
    public Instant getRecordedAt() { return recordedAt; }

    public void setConditionName(String conditionName) { this.conditionName = conditionName; }
    public void setSeverity(String severity) { this.severity = severity; }
    public void setMedication(String medication) { this.medication = medication; }
    public void setDoctorContact(String doctorContact) { this.doctorContact = doctorContact; }
    public void setNotes(String notes) { this.notes = notes; }
}
