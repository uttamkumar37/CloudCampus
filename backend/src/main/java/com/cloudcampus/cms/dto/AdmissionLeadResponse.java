package com.cloudcampus.cms.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class AdmissionLeadResponse {
    private UUID id;
    private String tenantId;
    private String parentName;
    private String parentEmail;
    private String parentPhone;
    private String studentName;
    private String applyingClass;
    private String message;
    private String status;
    private Instant submittedAt;
    private String notes;
}
