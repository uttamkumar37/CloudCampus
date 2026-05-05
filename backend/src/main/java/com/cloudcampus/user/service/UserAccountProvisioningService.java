package com.cloudcampus.user.service;

import com.cloudcampus.common.notification.NotificationChannel;
import com.cloudcampus.common.notification.NotificationService;
import com.cloudcampus.tenant.service.TenantContext;
import com.cloudcampus.user.entity.UserAccount;
import com.cloudcampus.user.entity.UserRole;
import com.cloudcampus.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAccountProvisioningService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Transactional
    public UserAccount createDefaultUserAccount(String fullName, String firstName, String phone, String email, UserRole role) {
        return createDefaultUserAccountWithCredentials(fullName, firstName, phone, email, role, true).user();
        }

        @Transactional
        public UserProvisioningResult createDefaultUserAccountWithCredentials(
            String fullName,
            String firstName,
            String phone,
            String email,
            UserRole role,
            boolean sendNotification
        ) {
        String normalizedEmail = normalizeNullableEmail(email);
        String normalizedPhone = normalizeNullablePhone(phone);

        if (StringUtils.hasText(normalizedEmail) && userAccountRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists: " + normalizedEmail);
        }
        if (StringUtils.hasText(normalizedPhone) && userAccountRepository.existsByPhone(normalizedPhone)) {
            throw new IllegalArgumentException("Phone already exists: " + normalizedPhone);
        }

        UserAccount user = new UserAccount();
        user.setFullName(fullName.trim());
        user.setRole(role);
        user.setTenantId(TenantContext.getTenant());
        user.setActive(true);
        user.setEmail(normalizedEmail);
        user.setPhone(normalizedPhone);

    UUID usernameSeed = UUID.randomUUID();
    GeneratedCredentials credentials = generateCredentials(role, usernameSeed, firstName, normalizedPhone);
        user.setUsername(credentials.username());
        user.setPasswordHash(passwordEncoder.encode(credentials.rawPassword()));
        user.setFirstLoginRequired(true);

        UserAccount saved = userAccountRepository.save(user);
        if (sendNotification) {
            notifyDefaultCredentials(saved, credentials.rawPassword());
        }
        return new UserProvisioningResult(saved, credentials);
    }

    @Transactional
    public void resetPasswordToDefault(UserAccount user) {
        resetPasswordToDefaultWithCredentials(user, true);
    }

    @Transactional
    public GeneratedCredentials resetPasswordToDefaultWithCredentials(UserAccount user, boolean sendNotification) {
        GeneratedCredentials credentials = generateCredentials(user.getRole(), user.getId(), user.getFullName(), user.getPhone());
        user.setPasswordHash(passwordEncoder.encode(credentials.rawPassword()));
        user.setFirstLoginRequired(true);
        userAccountRepository.save(user);
        if (sendNotification) {
            notifyDefaultCredentials(user, credentials.rawPassword());
        }
        return credentials;
    }

    private void notifyDefaultCredentials(UserAccount user, String rawPassword) {
        String message = "Your CloudCampus login credentials:\n"
                + "Username: " + user.getUsername() + "\n"
                + "Password: " + rawPassword + "\n"
                + "You will be asked to change your username and password on first login.";

        boolean sent = false;
        if (StringUtils.hasText(user.getEmail())) {
            notificationService.send(NotificationChannel.EMAIL, user.getEmail(), "CloudCampus Login Credentials", message);
            sent = true;
        }
        if (StringUtils.hasText(user.getPhone())) {
            notificationService.send(NotificationChannel.SMS, user.getPhone(), "CloudCampus Login Credentials", message);
            sent = true;
        }
        if (!sent) {
            log.warn("No email/phone available to send default credentials for userId={}", user.getId());
        }
    }

    private GeneratedCredentials generateCredentials(UserRole role, UUID id, String firstName, String phone) {
        String username = role.name().toLowerCase(Locale.ROOT) + "_" + shortId(id);
        String rawPassword = generateDefaultPassword(firstName, phone);
        return new GeneratedCredentials(username, rawPassword);
    }

    private String generateDefaultPassword(String firstName, String phone) {
        String last4 = last4Digits(phone);
        if (StringUtils.hasText(firstName) && StringUtils.hasText(last4)) {
            String safeFirst = firstName.trim().replaceAll("\\s+", "");
            return safeFirst + "@" + last4;
        }
        return randomPassword(12);
    }

    private String shortId(UUID id) {
        return id.toString().replace("-", "").substring(0, 8);
    }

    private String last4Digits(String phone) {
        if (!StringUtils.hasText(phone)) {
            return null;
        }
        String digits = phone.replaceAll("\\D+", "");
        if (digits.length() < 4) {
            return null;
        }
        return digits.substring(digits.length() - 4);
    }

    private String randomPassword(int length) {
        final String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(SECURE_RANDOM.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String normalizeNullableEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeNullablePhone(String phone) {
        if (!StringUtils.hasText(phone)) {
            return null;
        }
        return phone.trim();
    }
}

