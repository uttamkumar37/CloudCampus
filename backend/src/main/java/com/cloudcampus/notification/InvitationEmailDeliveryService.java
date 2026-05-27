package com.cloudcampus.notification;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;

import com.cloudcampus.events.outbox.TransactionalOutboxService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.invitation.Invitation;
import com.cloudcampus.school.School;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class InvitationEmailDeliveryService {

    private static final Logger LOGGER = LoggerFactory.getLogger(InvitationEmailDeliveryService.class);
    private static final String CHANNEL_EMAIL = "EMAIL";
    private static final String TEMPLATE_INVITATION = "ACCOUNT_INVITATION";

    private final NotificationDeliveryRepository notificationDeliveryRepository;
    private final TransactionalOutboxService transactionalOutboxService;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final TransactionTemplate transactionTemplate;
    private final String mode;
    private final String fromAddress;
    private final String appBaseUrl;

    public InvitationEmailDeliveryService(
            NotificationDeliveryRepository notificationDeliveryRepository,
            TransactionalOutboxService transactionalOutboxService,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            PlatformTransactionManager transactionManager,
            @Value("${cloudcampus.notifications.email.mode:log}") String mode,
            @Value("${cloudcampus.notifications.email.from:no-reply@cloudcampus.local}") String fromAddress,
            @Value("${cloudcampus.notifications.email.app-base-url:http://localhost:5173}") String appBaseUrl
    ) {
        this.notificationDeliveryRepository = notificationDeliveryRepository;
        this.transactionalOutboxService = transactionalOutboxService;
        this.mailSenderProvider = mailSenderProvider;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        this.mode = mode == null ? "log" : mode.trim().toLowerCase(Locale.ROOT);
        this.fromAddress = fromAddress;
        this.appBaseUrl = appBaseUrl;
    }

    public NotificationDelivery queueInvitation(Invitation invitation, String acceptancePath) {
        UserAccount user = invitation.getUser();
        School school = invitation.getSchool();
        String subject = "Set up your CloudCampus account";
        NotificationDelivery delivery = notificationDeliveryRepository.save(new NotificationDelivery(
                invitation.getTenant().getId(),
                school.getId(),
                invitation.getId(),
                user.getId(),
                CHANNEL_EMAIL,
                TEMPLATE_INVITATION,
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name(),
                subject,
                maskEmail(user.getEmail())
        ));

        transactionalOutboxService.record(
                delivery.getTenantId(),
                delivery.getSchoolId(),
                "NotificationDelivery",
                delivery.getId(),
                "InvitationEmailDeliveryRequested",
                "notification:invitation-email:" + invitation.getId(),
                Map.of(
                        "deliveryId", delivery.getId(),
                        "invitationId", invitation.getId(),
                        "tenantId", delivery.getTenantId(),
                        "schoolId", delivery.getSchoolId(),
                        "userId", delivery.getUserId(),
                        "recipientRole", delivery.getRecipientRole(),
                        "maskedRecipient", delivery.getMaskedRecipient(),
                        "channel", CHANNEL_EMAIL,
                        "template", TEMPLATE_INVITATION
                )
        );

        InvitationEmailMessage message = new InvitationEmailMessage(
                delivery.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name(),
                school.getName(),
                subject,
                toAbsoluteAcceptanceUrl(acceptancePath),
                invitation.getExpiresAt()
        );
        runAfterCommit(() -> dispatch(message));
        return delivery;
    }

    private void runAfterCommit(Runnable runnable) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    runnable.run();
                }
            });
            return;
        }
        runnable.run();
    }

    private void dispatch(InvitationEmailMessage message) {
        transactionTemplate.execute(status -> {
            NotificationDelivery delivery = notificationDeliveryRepository.findById(message.deliveryId())
                    .orElseThrow(() -> new IllegalStateException("Notification delivery was not found."));
            String provider = providerName();
            if ("disabled".equals(mode)) {
                delivery.markDisabled(provider, Instant.now());
                return null;
            }
            if ("smtp".equals(mode)) {
                try {
                    sendSmtp(message);
                    delivery.markSent(provider, Instant.now());
                } catch (MailException | IllegalStateException exception) {
                    delivery.markFailed(provider, exception.getMessage(), Instant.now());
                }
                return null;
            }
            delivery.markLogged(provider, Instant.now());
            LOGGER.info(
                    "Invitation email delivery logged for {} invitation {} using local mode.",
                    delivery.getMaskedRecipient(),
                    delivery.getInvitationId()
            );
            return null;
        });
    }

    private void sendSmtp(InvitationEmailMessage message) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            throw new IllegalStateException("JavaMailSender is not configured.");
        }
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom(fromAddress);
        mailMessage.setTo(message.recipientEmail());
        mailMessage.setSubject(message.subject());
        mailMessage.setText(body(message));
        mailSender.send(mailMessage);
    }

    private String body(InvitationEmailMessage message) {
        return """
                Hello %s,

                You have been invited to CloudCampus as %s for %s.

                Set your password using this secure link:
                %s

                This invitation expires at %s.
                If you were not expecting this invitation, you can ignore this email.
                """.formatted(
                message.recipientName(),
                message.recipientRole(),
                message.schoolName(),
                message.acceptanceUrl(),
                message.expiresAt()
        );
    }

    private String toAbsoluteAcceptanceUrl(String acceptancePath) {
        if (acceptancePath == null || acceptancePath.isBlank()) {
            return normalizedBaseUrl();
        }
        if (acceptancePath.startsWith("http://") || acceptancePath.startsWith("https://")) {
            return acceptancePath;
        }
        String path = acceptancePath.startsWith("/") ? acceptancePath : "/" + acceptancePath;
        return normalizedBaseUrl() + path;
    }

    private String normalizedBaseUrl() {
        if (appBaseUrl.endsWith("/")) {
            return appBaseUrl.substring(0, appBaseUrl.length() - 1);
        }
        return appBaseUrl;
    }

    private String providerName() {
        return "smtp".equals(mode) ? "SMTP" : mode.toUpperCase(Locale.ROOT);
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***" + email.substring(Math.max(atIndex, 0));
        }
        return email.charAt(0) + "***" + email.substring(atIndex);
    }

    private record InvitationEmailMessage(
            String deliveryId,
            String recipientEmail,
            String recipientName,
            String recipientRole,
            String schoolName,
            String subject,
            String acceptanceUrl,
            Instant expiresAt
    ) {
    }
}
