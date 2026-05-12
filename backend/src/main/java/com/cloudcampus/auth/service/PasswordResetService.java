package com.cloudcampus.auth.service;

/**
 * OTP-based password reset (CC-0107 / CC-0108).
 *
 * requestReset  — generates a 6-digit OTP, stores it in Redis (cc:otp:{userId})
 *                 with a 5-minute TTL, and emails it to the user.
 *                 Always returns without throwing — never reveals whether the
 *                 email address exists (OWASP user enumeration prevention).
 *
 * resetPassword — validates the OTP against the Redis-stored BCrypt hash,
 *                 updates the user's password, and deletes the OTP key.
 *                 Throws BadRequestException("Invalid or expired OTP") for all
 *                 failure cases to prevent information leakage.
 */
public interface PasswordResetService {

    /**
     * Initiate a password reset for the given email address.
     *
     * @param email the user's email (maps to User.username)
     */
    void requestReset(String email);

    /**
     * Verify the OTP and update the user's password.
     *
     * @param email       the user's email
     * @param otp         6-digit code from the reset email
     * @param newPassword the desired new password (minimum 8 chars enforced at DTO level)
     */
    void resetPassword(String email, String otp, String newPassword);
}
