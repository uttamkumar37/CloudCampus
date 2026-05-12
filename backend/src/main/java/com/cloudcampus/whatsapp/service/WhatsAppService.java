package com.cloudcampus.whatsapp.service;

import java.util.List;
import java.util.UUID;

/**
 * WhatsApp Business API outbound message dispatcher (CC-1004 / E14).
 *
 * E14 baseline: stub implementation — logs every attempt as FAILED with a
 * descriptive message until a real BSP (Business Solution Provider) account
 * is provisioned.  The interface is stable so real wiring only requires a
 * new {@code @Primary} implementation — no callers need to change.
 *
 * Real provider options (future):
 *  - Meta Cloud API (direct)
 *  - Twilio for WhatsApp
 *  - Gupshup / 360dialog (India BSP)
 */
public interface WhatsAppService {

    /**
     * Sends a WhatsApp template message asynchronously.
     *
     * @param tenantId        tenant UUID (for log scoping)
     * @param schoolId        school UUID (for log scoping)
     * @param to              destination phone in E.164 format (+91XXXXXXXXXX)
     * @param templateName    template registered in WhatsApp Business Manager
     * @param languageCode    BCP-47 language code (e.g. "en", "en_IN", "hi")
     * @param parameters      ordered variable substitution values; may be null
     */
    void sendTemplateAsync(UUID tenantId, UUID schoolId,
                           String to, String templateName, String languageCode,
                           List<String> parameters);
}
