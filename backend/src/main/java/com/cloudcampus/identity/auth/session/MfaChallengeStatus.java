package com.cloudcampus.identity.auth.session;

public enum MfaChallengeStatus {
    PENDING,
    VERIFIED,
    EXPIRED,
    LOCKED
}
