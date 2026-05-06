package com.cloudcampus.cms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "admission_leads", schema = "public")
public class AdmissionLead {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "parent_name", nullable = false, length = 150)
    private String parentName;

    @Column(name = "parent_email", length = 150)
    private String parentEmail;

    @Column(name = "parent_phone", nullable = false, length = 30)
    private String parentPhone;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "applying_class", length = 50)
    private String applyingClass;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "NEW";

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    void onCreate() {
        this.submittedAt = Instant.now();
    }
}
