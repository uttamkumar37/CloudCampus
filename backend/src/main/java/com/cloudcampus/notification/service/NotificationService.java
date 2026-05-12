package com.cloudcampus.notification.service;

import com.cloudcampus.notification.entity.NotificationTemplateCode;

import java.util.Map;
import java.util.UUID;

/**
 * Application-level notification dispatcher (CC-1001 / CC-1002).
 *
 * Implementations are responsible for:
 *  1. Rendering the template via {@link TemplateRenderer}.
 *  2. Sending the message through the appropriate channel.
 *  3. Persisting a {@code NotificationLog} row recording the outcome.
 *
 * All send operations are fire-and-forget: they run on the
 * {@code notificationExecutor} thread pool and never block the caller.
 */
public interface NotificationService {

    /**
     * Sends an email asynchronously via JavaMailSender.
     *
     * @param tenantId     tenant UUID (for log scoping)
     * @param schoolId     school UUID (for log scoping and reporting)
     * @param to           recipient email address
     * @param templateCode which template to render
     * @param variables    key/value substitution map for the template
     */
    void sendEmailAsync(UUID tenantId, UUID schoolId, String to,
                        NotificationTemplateCode templateCode,
                        Map<String, String> variables);

    /**
     * Sends an SMS asynchronously.
     *
     * E12 baseline: stub implementation — logs only; no real SMS gateway.
     * E13 will wire a real provider (Twilio / MSG91) behind this interface.
     *
     * @param tenantId     tenant UUID
     * @param schoolId     school UUID
     * @param phone        destination phone number in E.164 format (+91XXXXXXXXXX)
     * @param templateCode which template to render
     * @param variables    key/value substitution map for the template
     */
    void sendSmsAsync(UUID tenantId, UUID schoolId, String phone,
                      NotificationTemplateCode templateCode,
                      Map<String, String> variables);
}
