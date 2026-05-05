package com.cloudcampus.auth.service;

import com.cloudcampus.auth.otp.entity.OtpPurpose;
import com.cloudcampus.auth.otp.service.OtpService;
import com.cloudcampus.common.notification.NotificationChannel;
import com.cloudcampus.user.entity.UserAccount;
import com.cloudcampus.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CredentialsUpdateService {

    private static final Pattern PASSWORD_POLICY = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,64}$"
    );

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    @Transactional
    public void sendOtpForCredentialUpdate(UUID userId, NotificationChannel channel) {
        otpService.sendOtp(userId, channel, OtpPurpose.CREDENTIAL_UPDATE);
    }

    @Transactional
    public void verifyOtpAndUpdateCredentials(UUID userId, NotificationChannel channel, String otp, String newUsername, String newPassword) {
        String normalizedUsername = normalizeUsername(newUsername);
        validatePassword(newPassword);

        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (userAccountRepository.existsByUsernameAndIdNot(normalizedUsername, userId)) {
            throw new IllegalArgumentException("Username already exists: " + normalizedUsername);
        }

        otpService.verifyOtp(userId, channel, OtpPurpose.CREDENTIAL_UPDATE, otp);

        user.setUsername(normalizedUsername);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setFirstLoginRequired(false);
        userAccountRepository.save(user);
    }

    private String normalizeUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("newUsername is required");
        }
        String normalized = username.trim().toLowerCase(Locale.ROOT);
        if (normalized.length() < 5) {
            throw new IllegalArgumentException("Username must be at least 5 characters");
        }
        return normalized;
    }

    private void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("newPassword is required");
        }
        if (!PASSWORD_POLICY.matcher(password).matches()) {
            throw new IllegalArgumentException("Password must be at least 8 characters and include uppercase, lowercase, number, and special character");
        }
    }
}

