package com.cloudcampus.auth.otp.repository;

import com.cloudcampus.auth.otp.entity.OneTimePassword;
import com.cloudcampus.auth.otp.entity.OtpPurpose;
import com.cloudcampus.common.notification.NotificationChannel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OneTimePasswordRepository extends JpaRepository<OneTimePassword, UUID> {
    Optional<OneTimePassword> findTopByUserIdAndChannelAndPurposeOrderByCreatedAtDesc(
            UUID userId,
            NotificationChannel channel,
            OtpPurpose purpose
    );

    void deleteByUserIdAndChannelAndPurpose(UUID userId, NotificationChannel channel, OtpPurpose purpose);
}

