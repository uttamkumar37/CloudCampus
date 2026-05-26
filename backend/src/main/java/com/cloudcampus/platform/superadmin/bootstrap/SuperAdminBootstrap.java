package com.cloudcampus.platform.superadmin.bootstrap;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SuperAdminBootstrap implements ApplicationRunner {

    private final boolean enabled;
    private final String email;
    private final String password;
    private final String displayName;
    private final String tenantCode;
    private final Environment environment;
    private final TenantRepository tenantRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminBootstrap(
            @Value("${cloudcampus.bootstrap.super-admin.enabled:false}") boolean enabled,
            @Value("${cloudcampus.bootstrap.super-admin.email:}") String email,
            @Value("${cloudcampus.bootstrap.super-admin.password:}") String password,
            @Value("${cloudcampus.bootstrap.super-admin.display-name:CloudCampus Super Admin}") String displayName,
            @Value("${cloudcampus.bootstrap.super-admin.tenant-code:CLOUDCAMPUS}") String tenantCode,
            Environment environment,
            TenantRepository tenantRepository,
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.enabled = enabled;
        this.email = email;
        this.password = password;
        this.displayName = displayName;
        this.tenantCode = tenantCode;
        this.environment = environment;
        this.tenantRepository = tenantRepository;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        if (isProdProfileActive()) {
            throw new IllegalStateException("Super Admin bootstrap is not allowed in the prod profile.");
        }
        if (email == null || email.isBlank() || password == null || password.length() < 12) {
            throw new IllegalStateException("Super Admin bootstrap requires explicit email and a password of at least 12 characters.");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        List<UserAccount> existingUsers = userAccountRepository.findByEmailIgnoreCase(normalizedEmail);
        if (existingUsers.stream().anyMatch(user -> user.getRole() == UserRole.SUPER_ADMIN && user.getStatus() == UserStatus.ACTIVE)) {
            return;
        }
        if (!existingUsers.isEmpty()) {
            throw new IllegalStateException("Super Admin bootstrap email is already used by a non-SUPER_ADMIN account.");
        }

        Tenant platformTenant = tenantRepository.findByCode(normalizeCode(tenantCode))
                .orElseGet(() -> tenantRepository.save(new Tenant(normalizeCode(tenantCode), "CloudCampus Platform")));
        UserAccount superAdmin = new UserAccount(
                platformTenant,
                normalizedEmail,
                displayName.trim(),
                UserRole.SUPER_ADMIN
        );
        superAdmin.activate(passwordEncoder.encode(password), displayName.trim(), Instant.now());
        userAccountRepository.save(superAdmin);
    }

    private boolean isProdProfileActive() {
        return Arrays.stream(environment.getActiveProfiles())
                .anyMatch(profile -> "prod".equalsIgnoreCase(profile) || "production".equalsIgnoreCase(profile));
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }
}
