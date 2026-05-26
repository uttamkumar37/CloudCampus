package com.cloudcampus.testsupport;

import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicInteger;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

public final class AuthTestSupport {

    private static final AtomicInteger SEQUENCE = new AtomicInteger();

    private AuthTestSupport() {
    }

    public static TestUser issueAccessTokenForRole(
            UserRole role,
            TenantRepository tenantRepository,
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            JwtAccessTokenService jwtAccessTokenService
    ) {
        int suffix = SEQUENCE.incrementAndGet();
        Tenant tenant = tenantRepository.save(new Tenant(
                "TEST-" + role.name().replace('_', '-') + "-" + suffix,
                "Test " + role.name() + " Tenant"
        ));
        String normalizedRole = role.name().toLowerCase(Locale.ROOT).replace('_', '-');
        UserAccount user = new UserAccount(
                tenant,
                normalizedRole + "-" + suffix + "@authz.example",
                "Test " + role.name(),
                role
        );
        user.activate(passwordEncoder.encode("TestPassword123!"), "Test " + role.name(), Instant.now());
        userAccountRepository.save(user);
        return new TestUser(
                user.getId(),
                tenant.getId(),
                role,
                jwtAccessTokenService.issueToken(user.getId(), tenant.getId(), role, null)
        );
    }

    public record TestUser(
            String userId,
            String tenantId,
            UserRole role,
            String accessToken
    ) {
    }
}
