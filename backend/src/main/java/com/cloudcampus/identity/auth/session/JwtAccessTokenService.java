package com.cloudcampus.identity.auth.session;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.cloudcampus.common.exception.UnauthorizedException;
import com.cloudcampus.identity.auth.UserRole;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtAccessTokenService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String TOKEN_TYPE = "JWT";
    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();

    private final ObjectMapper objectMapper;
    private final byte[] signingSecret;
    private final long ttlMinutes;

    public JwtAccessTokenService(
            ObjectMapper objectMapper,
            @Value("${cloudcampus.auth.jwt-secret:dev-only-cloudcampus-auth-token-secret-change-me}") String signingSecret,
            @Value("${cloudcampus.auth.access-token-ttl-minutes:60}") long ttlMinutes
    ) {
        this.objectMapper = objectMapper;
        this.signingSecret = signingSecret.getBytes(StandardCharsets.UTF_8);
        this.ttlMinutes = ttlMinutes;
    }

    public String issueToken(String userId, String tenantId, UserRole role, String activeSchoolId) {
        Instant issuedAt = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        Instant expiresAt = issuedAt.plus(ttlMinutes, ChronoUnit.MINUTES);

        Map<String, Object> header = Map.of(
                "alg", "HS256",
                "typ", TOKEN_TYPE
        );
        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("sub", userId);
        payload.put("tenantId", tenantId);
        payload.put("role", role.name());
        payload.put("iat", issuedAt.getEpochSecond());
        payload.put("exp", expiresAt.getEpochSecond());
        if (activeSchoolId != null) {
            payload.put("activeSchoolId", activeSchoolId);
        }

        String unsignedToken = base64Json(header) + "." + base64Json(payload);
        return unsignedToken + "." + sign(unsignedToken);
    }

    public AuthTokenClaims verify(String token) {
        String[] parts = token.split("\\.", -1);
        if (parts.length != 3 || parts[0].isBlank() || parts[1].isBlank() || parts[2].isBlank()) {
            throw new UnauthorizedException("Access token is invalid.");
        }

        String unsignedToken = parts[0] + "." + parts[1];
        if (!MessageDigest.isEqual(sign(unsignedToken).getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
            throw new UnauthorizedException("Access token signature is invalid.");
        }

        Map<String, Object> payload = readJson(parts[1]);
        String userId = stringClaim(payload, "sub");
        String tenantId = stringClaim(payload, "tenantId");
        UserRole role = roleClaim(payload);
        Instant issuedAt = Instant.ofEpochSecond(longClaim(payload, "iat"));
        Instant expiresAt = Instant.ofEpochSecond(longClaim(payload, "exp"));
        if (!expiresAt.isAfter(Instant.now())) {
            throw new UnauthorizedException("Access token has expired.");
        }

        return new AuthTokenClaims(
                userId,
                tenantId,
                role,
                optionalStringClaim(payload, "activeSchoolId"),
                issuedAt,
                expiresAt
        );
    }

    public Instant expiresAt(String token) {
        return verify(token).expiresAt();
    }

    private String base64Json(Object value) {
        try {
            return BASE64_URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to serialize access token.", ex);
        }
    }

    private Map<String, Object> readJson(String encodedPayload) {
        try {
            byte[] json = BASE64_URL_DECODER.decode(encodedPayload);
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception ex) {
            throw new UnauthorizedException("Access token payload is invalid.", ex);
        }
    }

    private String sign(String unsignedToken) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(signingSecret, HMAC_ALGORITHM));
            return BASE64_URL_ENCODER.encodeToString(mac.doFinal(unsignedToken.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign access token.", ex);
        }
    }

    private String stringClaim(Map<String, Object> payload, String name) {
        String value = optionalStringClaim(payload, name);
        if (value == null || value.isBlank()) {
            throw new UnauthorizedException("Access token is missing " + name + ".");
        }
        return value;
    }

    private String optionalStringClaim(Map<String, Object> payload, String name) {
        Object value = payload.get(name);
        return value instanceof String string ? string : null;
    }

    private long longClaim(Map<String, Object> payload, String name) {
        Object value = payload.get(name);
        if (value instanceof Number number) {
            return number.longValue();
        }
        throw new UnauthorizedException("Access token is missing " + name + ".");
    }

    private UserRole roleClaim(Map<String, Object> payload) {
        try {
            return UserRole.valueOf(stringClaim(payload, "role"));
        } catch (IllegalArgumentException ex) {
            throw new UnauthorizedException("Access token role is invalid.", ex);
        }
    }
}
