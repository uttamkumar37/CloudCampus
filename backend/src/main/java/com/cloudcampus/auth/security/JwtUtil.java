package com.cloudcampus.auth.security;

import com.cloudcampus.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * C-10: Stateless JWT utility.
 *
 * Responsibilities:
 *   - Generate signed access tokens (HS256).
 *   - Validate and parse tokens.
 *   - Never store tokens — all state is in the token itself or Redis (refresh tokens).
 *
 * JWT claim conventions:
 *   sub          — user ID (UUID string)
 *   tenant_id    — tenant UUID (null for SUPER_ADMIN)
 *   school_id    — school UUID (null if not school-scoped)
 *   role         — UserRole string
 *   jti          — unique token ID (for future revocation support)
 *
 * Access token TTL: 15 minutes (configured via app.jwt.access-token-expiry-seconds).
 * Refresh tokens: opaque random strings stored in Redis (implemented in CC-0105).
 */
@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private static final String CLAIM_TENANT_ID = "tenant_id";
    private static final String CLAIM_SCHOOL_ID = "school_id";
    private static final String CLAIM_ROLE       = "role";

    private final SecretKey signingKey;
    private final long accessTokenExpirySeconds;

    public JwtUtil(JwtProperties jwtProperties) {
        // Minimum 32 characters enforced — JJWT will throw if key is too short for HS256.
        this.signingKey = Keys.hmacShaKeyFor(
                jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirySeconds = jwtProperties.accessTokenExpirySeconds();
    }

    /**
     * Generate a signed access token.
     *
     * @param userId    the authenticated user's UUID
     * @param tenantId  the tenant UUID (null for SUPER_ADMIN)
     * @param schoolId  the school UUID (null if not school-scoped)
     * @param role      the user's role (e.g. "SUPER_ADMIN", "TENANT_ADMIN")
     */
    public String generateAccessToken(UUID userId, UUID tenantId, UUID schoolId, String role) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(accessTokenExpirySeconds);

        return Jwts.builder()
                .subject(userId.toString())
                .id(UUID.randomUUID().toString())     // jti — unique token ID
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claims(buildClaims(tenantId, schoolId, role))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Validate and parse a JWT.
     *
     * @return Optional with parsed Claims on success, empty Optional on any validation failure.
     *         Callers must treat empty Optional as an authentication failure.
     */
    public Optional<Claims> validateAndParse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (JwtException ex) {
            log.debug("JWT validation failed: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    public Optional<UUID> extractUserId(Claims claims) {
        try {
            return Optional.of(UUID.fromString(claims.getSubject()));
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    public Optional<UUID> extractTenantId(Claims claims) {
        String tenantId = claims.get(CLAIM_TENANT_ID, String.class);
        if (tenantId == null) return Optional.empty();
        try {
            return Optional.of(UUID.fromString(tenantId));
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    public Optional<String> extractRole(Claims claims) {
        return Optional.ofNullable(claims.get(CLAIM_ROLE, String.class));
    }

    private Map<String, Object> buildClaims(UUID tenantId, UUID schoolId, String role) {
        Map<String, Object> claims = new java.util.HashMap<>();
        if (tenantId != null) claims.put(CLAIM_TENANT_ID, tenantId.toString());
        if (schoolId != null) claims.put(CLAIM_SCHOOL_ID, schoolId.toString());
        claims.put(CLAIM_ROLE, role);
        return claims;
    }
}
