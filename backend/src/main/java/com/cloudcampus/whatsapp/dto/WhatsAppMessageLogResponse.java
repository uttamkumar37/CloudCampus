package com.cloudcampus.whatsapp.dto;

import com.cloudcampus.whatsapp.entity.WhatsAppMessageLog;
import com.cloudcampus.whatsapp.entity.WhatsAppStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * Read-only projection of {@link WhatsAppMessageLog} for API responses.
 */
public record WhatsAppMessageLogResponse(
        UUID          id,
        UUID          schoolId,
        String        recipient,
        String        templateName,
        String        languageCode,
        WhatsAppStatus status,
        String        errorMessage,
        Instant       sentAt,
        Instant       createdAt
) {
    public static WhatsAppMessageLogResponse from(WhatsAppMessageLog log) {
        return new WhatsAppMessageLogResponse(
                log.getId(),
                log.getSchoolId(),
                log.getRecipient(),
                log.getTemplateName(),
                log.getLanguageCode(),
                log.getStatus(),
                log.getErrorMessage(),
                log.getSentAt(),
                log.getCreatedAt()
        );
    }
}
