package com.cloudcampus.identity.auth.session;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

import com.cloudcampus.common.exception.TooManyRequestsException;

import org.springframework.stereotype.Service;

@Service
public class LoginRateLimiterService {

    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final Duration BLOCK_DURATION = Duration.ofMinutes(15);

    private final ConcurrentHashMap<String, LoginAttempt> attempts = new ConcurrentHashMap<>();

    public void assertLoginAllowed(String rawEmail) {
        String key = key(rawEmail);
        LoginAttempt attempt = attempts.get(key);
        Instant now = Instant.now();
        if (attempt == null) {
            return;
        }
        if (attempt.blockedUntil() != null && attempt.blockedUntil().isAfter(now)) {
            throw new TooManyRequestsException("Too many failed login attempts. Try again later.");
        }
        if (attempt.windowStartedAt().plus(WINDOW).isBefore(now)) {
            attempts.remove(key);
        }
    }

    public void recordFailure(String rawEmail) {
        String key = key(rawEmail);
        Instant now = Instant.now();
        attempts.compute(key, (ignored, current) -> {
            if (current == null || current.windowStartedAt().plus(WINDOW).isBefore(now)) {
                return new LoginAttempt(1, now, null);
            }
            int failures = current.failureCount() + 1;
            Instant blockedUntil = failures >= MAX_FAILURES ? now.plus(BLOCK_DURATION) : current.blockedUntil();
            return new LoginAttempt(failures, current.windowStartedAt(), blockedUntil);
        });
    }

    public void recordSuccess(String rawEmail) {
        attempts.remove(key(rawEmail));
    }

    private String key(String rawEmail) {
        return rawEmail == null ? "" : rawEmail.trim().toLowerCase(Locale.ROOT);
    }

    private record LoginAttempt(int failureCount, Instant windowStartedAt, Instant blockedUntil) {
    }
}
