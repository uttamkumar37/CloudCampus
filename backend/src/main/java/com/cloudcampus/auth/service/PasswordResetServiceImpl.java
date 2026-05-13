package com.cloudcampus.auth.service;

import com.cloudcampus.auth.entity.User;
import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.config.OtpProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Optional;

/**
 * OTP-based password reset implementation (CC-0107 / CC-0108).
 *
 * Security design:
 *
 * 1. User enumeration prevention:
 *    requestReset() returns silently when the email is not found — the caller
 *    cannot distinguish "email exists" from "email not found".
 *
 * 2. OTP storage:
 *    The raw OTP is NEVER stored. Only the BCrypt hash is written to Redis under
 *    key cc:otp:{userId} with a 5-minute TTL. This limits exposure if Redis is
 *    ever accessed by an attacker.
 *
 * 3. One-time use:
 *    The Redis key is deleted immediately after a successful reset, preventing
 *    OTP reuse within the TTL window.
 *
 * 4. Constant-time failure message:
 *    resetPassword() always throws "Invalid or expired OTP" — it never reveals
 *    whether the failure was due to an unknown email, expired OTP, or wrong OTP.
 */
@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetServiceImpl.class);

    /** Redis key prefix — matches architecture doc: cc:otp:{userId} */
    static final String OTP_KEY_PREFIX = "cc:otp:";

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final OtpProperties otpProperties;

    public PasswordResetServiceImpl(
            UserRepository userRepository,
            RedisTemplate<String, String> redisTemplate,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender,
            OtpProperties otpProperties) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.otpProperties = otpProperties;
    }

    /**
     * Generate and deliver a password-reset OTP.
     *
     * Always returns without throwing — OWASP user enumeration prevention.
     * If the email is unknown, the method returns silently (no email sent).
     */
    @Override
    public void requestReset(String email) {
        Optional<User> userOpt = userRepository.findByUsername(email);
        if (userOpt.isEmpty()) {
            // SECURITY: Do not reveal that the email is not registered.
            log.debug("Password reset requested for unregistered email (suppressed)");
            return;
        }

        User user = userOpt.get();
        String otp = generateOtp();
        String hashedOtp = passwordEncoder.encode(otp);

        String key = OTP_KEY_PREFIX + user.getId();
        redisTemplate.opsForValue().set(key, hashedOtp, Duration.ofSeconds(otpProperties.ttlSeconds()));

        sendOtpEmail(email, otp);

        log.info("Password reset OTP issued for user {}", user.getId());
    }

    /**
     * Verify the OTP and update the user's password.
     *
     * Throws BadRequestException for all failure cases — never leaks whether the
     * failure was "wrong OTP", "expired OTP", or "unknown email".
     */
    @Override
    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        String key = OTP_KEY_PREFIX + user.getId();
        String storedHash = redisTemplate.opsForValue().get(key);

        if (storedHash == null || !passwordEncoder.matches(otp, storedHash)) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // One-time use: delete immediately after successful reset.
        redisTemplate.delete(key);

        log.info("Password reset completed for user {}", user.getId());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String generateOtp() {
        int length = otpProperties.length();
        int bound = (int) Math.pow(10, length);
        return String.format("%0" + length + "d", SECURE_RANDOM.nextInt(bound));
    }

    private void sendOtpEmail(String to, String otp) {
        int expiryMinutes = otpProperties.ttlSeconds() / 60;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(otpProperties.fromEmail());
        message.setTo(to);
        message.setSubject("CloudCampus \u2014 Your Password Reset Code");
        message.setText(
                "Your password reset code is: " + otp + "\n\n"
                + "This code expires in " + expiryMinutes + " minutes.\n\n"
                + "If you did not request a password reset, you can safely ignore this email."
        );
        mailSender.send(message);
    }
}
