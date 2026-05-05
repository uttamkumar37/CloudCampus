package com.cloudcampus.auth.otp.service;

import com.cloudcampus.auth.otp.entity.OneTimePassword;
import com.cloudcampus.auth.otp.entity.OtpPurpose;
import com.cloudcampus.auth.otp.repository.OneTimePasswordRepository;
import com.cloudcampus.common.notification.NotificationChannel;
import com.cloudcampus.common.notification.NotificationService;
import com.cloudcampus.user.entity.UserAccount;
import com.cloudcampus.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final Duration MIN_RESEND_INTERVAL = Duration.ofSeconds(30);
    private static final int MAX_VERIFY_ATTEMPTS = 3;

    private final OneTimePasswordRepository oneTimePasswordRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public void sendOtp(UUID userId, NotificationChannel channel, OtpPurpose purpose) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String destination = resolveDestination(user, channel);

        oneTimePasswordRepository.findTopByUserIdAndChannelAndPurposeOrderByCreatedAtDesc(userId, channel, purpose)
                .ifPresent(existing -> {
                    if (existing.getCreatedAt() != null
                            && existing.getCreatedAt().isAfter(Instant.now().minus(MIN_RESEND_INTERVAL))) {
                        throw new IllegalArgumentException("OTP already sent recently. Please wait and try again.");
                    }
                });

        oneTimePasswordRepository.deleteByUserIdAndChannelAndPurpose(userId, channel, purpose);

        String otp = generateOtp();
        OneTimePassword token = new OneTimePassword();
        token.setUserId(userId);
        token.setChannel(channel);
        token.setPurpose(purpose);
        token.setDestination(destination);
        token.setOtpHash(passwordEncoder.encode(otp));
        token.setExpiresAt(Instant.now().plus(OTP_TTL));
        token.setVerifyAttempts(0);
        oneTimePasswordRepository.save(token);

        String message = "Your CloudCampus OTP is: " + otp + ". It expires in 5 minutes.";
        notificationService.send(channel, destination, "CloudCampus OTP", message);
    }

    @Override
    @Transactional
    public void verifyOtp(UUID userId, NotificationChannel channel, OtpPurpose purpose, String otp) {
        if (!StringUtils.hasText(otp)) {
            throw new IllegalArgumentException("OTP is required");
        }
        OneTimePassword token = oneTimePasswordRepository
                .findTopByUserIdAndChannelAndPurposeOrderByCreatedAtDesc(userId, channel, purpose)
                .orElseThrow(() -> new IllegalArgumentException("OTP not found. Please request a new OTP."));

        if (Instant.now().isAfter(token.getExpiresAt())) {
            throw new IllegalArgumentException("OTP expired. Please request a new OTP.");
        }
        if (token.getVerifyAttempts() >= MAX_VERIFY_ATTEMPTS) {
            throw new IllegalArgumentException("OTP retry limit exceeded. Please request a new OTP.");
        }

        if (!passwordEncoder.matches(otp.trim(), token.getOtpHash())) {
            token.setVerifyAttempts(token.getVerifyAttempts() + 1);
            oneTimePasswordRepository.save(token);
            throw new IllegalArgumentException("Invalid OTP");
        }

        oneTimePasswordRepository.deleteById(token.getId());
    }

    private String resolveDestination(UserAccount user, NotificationChannel channel) {
        if (channel == NotificationChannel.EMAIL) {
            if (!StringUtils.hasText(user.getEmail())) {
                throw new IllegalArgumentException("Email is not available for this account");
            }
            return user.getEmail();
        }
        if (!StringUtils.hasText(user.getPhone())) {
            throw new IllegalArgumentException("Phone is not available for this account");
        }
        return user.getPhone();
    }

    private String generateOtp() {
        int value = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(value);
    }
}

