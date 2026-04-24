package com.campuscloud.auth.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;

/**
 * Unified principal for JWT and method security. Bootstrap super-admin has {@code userId == null}.
 */
@Getter
public class CampusUserDetails implements UserDetails {

    private final UUID userId;
    private final String username;
    private final String password;
    private final String email;
    private final String fullName;
    private final String tenantSchema;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean enabled;

    public CampusUserDetails(
            UUID userId,
            String username,
            String password,
            String email,
            String fullName,
            String tenantSchema,
            Collection<? extends GrantedAuthority> authorities,
            boolean enabled
    ) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.email = email;
        this.fullName = fullName;
        this.tenantSchema = tenantSchema;
        this.authorities = authorities;
        this.enabled = enabled;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
