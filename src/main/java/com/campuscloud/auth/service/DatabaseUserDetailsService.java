package com.campuscloud.auth.service;

import com.campuscloud.tenant.service.TenantContext;
import com.campuscloud.user.entity.UserAccount;
import com.campuscloud.user.repository.UserAccountRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        this.encodedBootstrapPassword = passwordEncoder.encode(bootstrapPassword);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalizedUsername = username.trim().toLowerCase(Locale.ROOT);

        if (bootstrapUsername.equalsIgnoreCase(normalizedUsername)) {
            return User.builder()
                    .username(bootstrapUsername)
                    .password(encodedBootstrapPassword)
                    .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + bootstrapRole)))
                    .build();
        }

        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new UsernameNotFoundException("Tenant context required for non-bootstrap login");
        }

        UserAccount user = userAccountRepository.findByUsernameAndActiveTrue(normalizedUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }
}
