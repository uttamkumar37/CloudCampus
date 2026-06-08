package com.cloudcampus.intelligence.ai;

import java.time.Instant;
import java.util.UUID;

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

@Entity
@Table(name = "automation_runs")
public class AutomationRun {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "automation_rule_id", nullable = false)
    private AutomationRule automationRule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AutomationRunStatus status;

    @Column(nullable = false, length = 40)
    private String triggeredByActorType;

    @Column(length = 36)
    private String triggeredByActorId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String inputSummaryJson = "{}";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String outputSummaryJson = "{}";

    @Column(length = 500)
    private String errorMessage;

    @Column(nullable = false)
    private Instant startedAt;

    private Instant completedAt;

    @Column(nullable = false)
    private Instant createdAt;

    protected AutomationRun() {
    }

    public AutomationRun(
            AutomationRule automationRule,
            AutomationRunStatus status,
            String triggeredByActorType,
            String triggeredByActorId,
            String inputSummaryJson
    ) {
        this.automationRule = automationRule;
        this.tenant = automationRule.getTenant();
        this.school = automationRule.getSchool();
        this.status = status;
        this.triggeredByActorType = triggeredByActorType;
        this.triggeredByActorId = triggeredByActorId;
        this.inputSummaryJson = inputSummaryJson == null || inputSummaryJson.isBlank() ? "{}" : inputSummaryJson;
        this.startedAt = Instant.now();
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (startedAt == null) {
            startedAt = now;
        }
        if (createdAt == null) {
            createdAt = now;
        }
    }

    public void complete(String outputSummaryJson, Instant now) {
        status = AutomationRunStatus.COMPLETED;
        this.outputSummaryJson = outputSummaryJson == null || outputSummaryJson.isBlank() ? "{}" : outputSummaryJson;
        completedAt = now;
    }

    public void fail(String errorMessage, Instant now) {
        status = AutomationRunStatus.FAILED;
        this.errorMessage = errorMessage;
        completedAt = now;
    }

    public String getId() {
        return id;
    }

    public AutomationRule getAutomationRule() {
        return automationRule;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public School getSchool() {
        return school;
    }

    public AutomationRunStatus getStatus() {
        return status;
    }

    public String getTriggeredByActorType() {
        return triggeredByActorType;
    }

    public String getInputSummaryJson() {
        return inputSummaryJson;
    }

    public String getOutputSummaryJson() {
        return outputSummaryJson;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
