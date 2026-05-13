package com.cloudcampus.notification.dto;

import com.cloudcampus.notification.entity.DevicePlatform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request body for POST /v1/devices/register.
 *
 * The mobile client sends this on every login and whenever the OS rotates the
 * push token. The backend upserts the token so stale entries are refreshed.
 */
public record DeviceRegisterRequest(

    /** Native FCM token (Android) or APNs device token (iOS). */
    @NotBlank(message = "pushToken must not be blank")
    @Size(max = 512, message = "pushToken must not exceed 512 characters")
    String pushToken,

    /** Target platform. */
    @NotNull(message = "platform must not be null")
    DevicePlatform platform,

    /** Expo push token (optional — useful for Expo Go dev testing). */
    @Size(max = 512, message = "expoPushToken must not exceed 512 characters")
    String expoPushToken,

    /**
     * Optional device fingerprint for diagnostics
     * (e.g. "iPhone16,2 / iOS 18.2").
     */
    @Size(max = 255, message = "deviceFingerprint must not exceed 255 characters")
    String deviceFingerprint
) {}
