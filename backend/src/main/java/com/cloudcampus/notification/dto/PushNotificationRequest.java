package com.cloudcampus.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

/**
 * Request body for {@code POST /v1/school-admin/schools/{schoolId}/notifications/send-push}.
 *
 * The server looks up all device tokens registered to {@code userId} and
 * fans out one FCM / APNs message per token.
 *
 * {@code data} is an optional string-keyed map forwarded verbatim to the FCM
 * data payload — useful for deep-linking and client-side routing.
 *
 * SECURITY: {@code userId} must belong to the school referenced in the path.
 * The controller is responsible for validating school membership before
 * dispatching (enforcement added in CC-1003).
 */
public record PushNotificationRequest(

        @NotNull(message = "userId is required")
        UUID userId,

        @NotBlank(message = "title is required")
        String title,

        @NotBlank(message = "body is required")
        String body,

        /**
         * Optional FCM data payload. All values must be strings (FCM spec).
         * Null is treated as an empty map — never forwarded as {@code null}
         * to the Firebase SDK.
         */
        Map<String, String> data

) {
    /** Returns a safe (non-null) copy of the data map. */
    public Map<String, String> safeData() {
        return (data != null) ? Collections.unmodifiableMap(data) : Collections.emptyMap();
    }
}
