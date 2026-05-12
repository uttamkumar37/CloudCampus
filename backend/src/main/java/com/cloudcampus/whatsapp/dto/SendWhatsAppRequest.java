package com.cloudcampus.whatsapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.List;

/**
 * Request body for {@code POST /v1/school-admin/schools/{schoolId}/whatsapp/send}.
 *
 * Mirrors the WhatsApp Business API template-message structure:
 *  - {@code to}            destination phone in E.164 format
 *  - {@code templateName}  template registered in WhatsApp Business Manager
 *  - {@code languageCode}  BCP-47 code used when the template was created
 *  - {@code parameters}    ordered list of variable substitution values
 *
 * E14 baseline: stub — all messages are logged as FAILED with a clear reason
 * until a real BSP account is provisioned and wired.
 */
public record SendWhatsAppRequest(

        @NotBlank(message = "to is required")
        @Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "Must be a valid E.164 phone number (e.g. +919876543210)")
        String to,

        @NotBlank(message = "templateName is required")
        String templateName,

        /**
         * BCP-47 language code for the template (default: "en").
         * Use "en_IN" for English (India), "hi" for Hindi, etc.
         */
        String languageCode,

        /**
         * Ordered list of positional variable values for the template body.
         * Pass {@code null} or an empty list for templates with no variables.
         */
        List<String> parameters

) {
    public String safeLanguageCode() {
        return (languageCode != null && !languageCode.isBlank()) ? languageCode : "en";
    }
}
