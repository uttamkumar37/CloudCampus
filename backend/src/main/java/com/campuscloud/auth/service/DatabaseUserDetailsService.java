package com.campuscloud.auth.service;

import com.campuscloud.auth.security.CampusUserDetails;
import com.campuscloud.tenant.service.TenantContext;
import com.campuscloud.user.entity.UserAccount;
import com.campuscloud.user.repository.UserAccountRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.bootstrap-admin.username}")
    private String bootstrapUsername;

    @Value("${app.security.bootstrap-admin.password}")
    private String bootstrapPassword;

    @Value("${app.security.bootstrap-admin.role}")
    private String bootstrapRole;

    private String encodedBootstrapPassword;

    @PostConstruct
    void initBootstrapCredentials() {
        validateBootstrapCredentials();
        this.encodedBootstrapPassword = passwordEncoder.encode(bootstrapPassword);
    }

    private void validateBootstrapCredentials() {
        if (!StringUtils.hasText(bootstrapUsername)) {
            throw new IllegalStateException("BOOTSTRAP_ADMIN_USERNAME is required");
        }
        if (!StringUtils.hasText(bootstrapPassword)) {
            throw new IllegalStateException("BOOTSTRAP_ADMIN_PASSWORD is required");
        }
        if (bootstrapPassword.length() < 8) {
            throw new IllegalStateException("BOOTSTRAP_ADMIN_PASSWORD must be at least 8 characters");
        }
        if (!StringUtils.hasText(bootstrapRole)) {
            throw new IllegalStateException("BOOTSTRAP_ADMIN_ROLE is required");
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalizedUsername = username.trim().toLowerCase(Locale.ROOT);

        if (bootstrapUsername.equalsIgnoreCase(normalizedUsername)) {
            return new CampusUserDetails(
                    null,
                    bootstrapUsername,
                    encodedBootstrapPassword,
                    null,
                    "Platform Super Admin",
                    TenantContext.DEFAULT_SCHEMA,
                    List.of(new SimpleGrantedAuthority("ROLE_" + bootstrapRole)),
                    true
            );
        }

        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new UsernameNotFoundException("Tenant context required for non-bootstrap login");
        }

        UserAccount user = userAccountRepository.findByUsernameAndActiveTrue(normalizedUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        String schema = TenantContext.getTenant();
        return new CampusUserDetails(
                user.getId(),
                user.getUsername(),
                user.getPasswordHash(),
                user.getEmail(),
                user.getFullName(),
                schema,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                user.isActive()
        );
    }
}
