package com.cloudcampus.notification.dto;

import com.cloudcampus.notification.entity.NotificationTemplateCode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

/**
 * Request body for the manual send-email endpoint.
 *
 * {@code schoolId} is taken from the path variable, not this body.
 * {@code variables} map is optional — empty map is valid for GENERIC template
 * where subject and body are provided directly inside the map.
 */
public record SendEmailRequest(

        @NotBlank(message = "Recipient email must not be blank")
        @Email(message = "Recipient must be a valid email address")
        String to,

        @NotNull(message = "Template code is required")
        NotificationTemplateCode templateCode,

        /** Template variable substitutions — e.g. studentName, receiptNumber, amount. */
        Map<String, String> variables
) {
    public Map<String, String> safeVariables() {
        return variables == null ? Map.of() : variables;
    }
}
