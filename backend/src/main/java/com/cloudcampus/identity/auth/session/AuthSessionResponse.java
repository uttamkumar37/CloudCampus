package com.cloudcampus.identity.auth.session;

import java.time.Instant;

public record AuthSessionResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        Instant expiresAt,
        CurrentUserResponse user,
        boolean mfaRequired,
        String mfaChallengeId,
        String mfaCode,
        Instant mfaExpiresAt
) {

    @Override
    public String toString() {
        return "AuthSessionResponse[accessToken=%s, refreshToken=%s, tokenType=%s, expiresAt=%s, user=%s, mfaRequired=%s, mfaChallengeId=%s, mfaCode=%s, mfaExpiresAt=%s]"
                .formatted(
                        accessToken == null ? null : "[redacted]",
                        refreshToken == null ? null : "[redacted]",
                        tokenType,
                        expiresAt,
                        user,
                        mfaRequired,
                        mfaChallengeId == null ? null : "[redacted]",
                        mfaCode == null ? null : "[redacted]",
                        mfaExpiresAt
                );
    }
}
