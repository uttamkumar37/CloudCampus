package com.cloudcampus.auth.otp.service;

import com.cloudcampus.auth.otp.entity.OtpPurpose;
import com.cloudcampus.common.notification.NotificationChannel;

import java.util.UUID;

public interface OtpService {
    void sendOtp(UUID userId, NotificationChannel channel, OtpPurpose purpose);

    void verifyOtp(UUID userId, NotificationChannel channel, OtpPurpose purpose, String otp);
}

