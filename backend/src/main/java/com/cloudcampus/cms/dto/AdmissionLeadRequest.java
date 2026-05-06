package com.cloudcampus.cms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdmissionLeadRequest {
    @NotBlank
    private String parentName;
    private String parentEmail;
    @NotBlank
    private String parentPhone;
    @NotBlank
    private String studentName;
    private String applyingClass;
    private String message;
}
