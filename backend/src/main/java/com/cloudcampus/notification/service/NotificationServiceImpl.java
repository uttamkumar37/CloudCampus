package com.cloudcampus.notification.service;

import com.cloudcampus.notification.entity.NotificationChannel;
import com.cloudcampus.notification.entity.NotificationLog;
import com.cloudcampus.notification.entity.NotificationTemplateCode;
import com.cloudcampus.notification.repository.NotificationLogRepository;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Notification dispatcher — CC-1002 (Email) + CC-1001 stub (SMS).
 *
 * Email flow:
 *  1. Render HTML + plain-text body via {@link TemplateRenderer}.
 *  2. Send MIME message via {@link JavaMailSender} (MailHog in dev, real SMTP in prod).
 *  3. Persist a {@link NotificationLog} row with SENT or FAILED status.
 *
 * SMS flow (E12 stub):
 *  - Logs only. Real gateway is wired in E13.
 *
 * Async:
 *  Both methods run on {@code notificationExecutor} via Spring's {@code @Async} proxy.
 *  {@code REQUIRES_NEW} transaction ensures the log row is committed independently
 *  of any caller transaction — a failed email will not roll back the caller's work.
 *
 * Security:
 *  - The {@code from} address is read from {@code spring.mail.username}; it is never
 *    influenced by caller-supplied data.
 *  - Template variables are used for body text only and never interpreted as commands.
 */
@Service
class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final JavaMailSender            mailSender;
    private final NotificationLogRepository logRepo;

    NotificationServiceImpl(JavaMailSender mailSender,
                             NotificationLogRepository logRepo) {
        this.mailSender = mailSender;
        this.logRepo    = logRepo;
    }

    // ── Email ────────────────────────────────────────────────────────────────

    @Async("notificationExecutor")
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendEmailAsync(UUID tenantId, UUID schoolId, String to,
                                NotificationTemplateCode templateCode,
                                Map<String, String> variables) {

        TemplateRenderer.RenderedEmail rendered = TemplateRenderer.render(templateCode, variables);

        NotificationLog entry = NotificationLog.create(
                tenantId, schoolId,
                NotificationChannel.EMAIL, templateCode,
                to, rendered.subject());

        try {
            var message = mailSender.createMimeMessage();
            var helper  = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(rendered.subject());
            // Set HTML body with plain-text fallback for basic mail clients
            helper.setText(rendered.plainText(), rendered.htmlBody());
            mailSender.send(message);

            entry.markSent();
            log.info("Email sent: template={} recipient={} tenantId={}", templateCode, to, tenantId);

        } catch (MailException | MessagingException ex) {
            entry.markFailed(ex.getMessage());
            log.warn("Email send failed: template={} recipient={} error={}",
                    templateCode, to, ex.getMessage());
        }

        logRepo.save(entry);
    }

    // ── SMS (E12 stub) ───────────────────────────────────────────────────────

    @Async("notificationExecutor")
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendSmsAsync(UUID tenantId, UUID schoolId, String phone,
                              NotificationTemplateCode templateCode,
                              Map<String, String> variables) {

        // E12 stub: log the attempt but do not call any SMS gateway.
        // E13 will replace this with a real provider (Twilio / MSG91).
        TemplateRenderer.RenderedEmail rendered = TemplateRenderer.render(templateCode, variables);

        NotificationLog entry = NotificationLog.create(
                tenantId, schoolId,
                NotificationChannel.SMS, templateCode,
                phone, null);  // SMS has no subject

        // Intentionally mark SENT=false (FAILED) so ops can see SMS is not yet wired.
        entry.markFailed("SMS gateway not configured — E12 stub");

        logRepo.save(entry);

        log.info("SMS stub: template={} phone={} body={}", templateCode, phone, rendered.plainText());
    }
}
