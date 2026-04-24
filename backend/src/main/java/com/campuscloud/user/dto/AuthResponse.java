package com.campuscloud.user.dto;

import java.util.List;

public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn;
    private String username;
    private String role;
    private List<String> roles;
    private String tenantId;

    public AuthResponse() {}

    public AuthResponse(String accessToken, long expiresIn, String username, String role, List<String> roles, String tenantId) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.username = username;
        this.role = role;
        this.roles = roles;
        this.tenantId = tenantId;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
}
