package com.cloudcampus.identity.auth.session;

public record LogoutRequest(
        String refreshToken
) {
}
