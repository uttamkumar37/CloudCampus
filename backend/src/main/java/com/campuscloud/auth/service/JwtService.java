package com.campuscloud.auth.service;

import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {

    String generateAccessToken(UserDetails userDetails);

    String extractUsername(String token);

    String extractUserId(String token);

    String extractTenantSchema(String token);

    boolean isTokenValid(String token, UserDetails userDetails);

    long getAccessTokenExpirationSeconds();
}
