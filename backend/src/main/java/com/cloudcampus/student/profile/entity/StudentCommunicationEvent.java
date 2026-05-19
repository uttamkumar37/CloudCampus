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
@Table(name = "student_communication_events")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class StudentCommunicationEvent {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(nullable = false)
    private String channel;

    @Column(nullable = false)
    private String direction;

    @Column(nullable = false)
    private String subject;

    private String summary;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected StudentCommunicationEvent() {}

    public static StudentCommunicationEvent create(UUID tenantId, UUID schoolId, UUID studentId) {
        StudentCommunicationEvent e = new StudentCommunicationEvent();
        e.tenantId = tenantId;
        e.schoolId = schoolId;
        e.studentId = studentId;
        return e;
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (occurredAt == null) occurredAt = Instant.now();
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getChannel() { return channel; }
    public String getDirection() { return direction; }
    public String getSubject() { return subject; }
    public String getSummary() { return summary; }
    public Instant getOccurredAt() { return occurredAt; }

    public void setChannel(String channel) { this.channel = channel; }
    public void setDirection(String direction) { this.direction = direction; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setSummary(String summary) { this.summary = summary; }
}
