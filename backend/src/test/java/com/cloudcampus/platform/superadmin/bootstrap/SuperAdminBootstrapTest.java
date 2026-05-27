package com.cloudcampus.platform.superadmin.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.password.PasswordEncoder;

class SuperAdminBootstrapTest {

    @Test
    void createsLocalDevelopmentSuperAdminWhenEnabled() {
        TenantRepository tenantRepository = mock(TenantRepository.class);
        UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        Tenant platformTenant = new Tenant("CLOUDCAMPUS", "CloudCampus Platform");
        when(tenantRepository.findByCode("CLOUDCAMPUS")).thenReturn(Optional.empty());
        when(tenantRepository.save(any(Tenant.class))).thenReturn(platformTenant);
        when(userAccountRepository.findByEmailIgnoreCase("superadmin@cloudcampus.dev")).thenReturn(List.of());
        when(passwordEncoder.encode("SuperAdmin123!")).thenReturn("encoded-super-admin-password");

        new SuperAdminBootstrap(
                true,
                "superadmin@cloudcampus.dev",
                "SuperAdmin123!",
                "CloudCampus Super Admin",
                "CLOUDCAMPUS",
                environment("local"),
                tenantRepository,
                userAccountRepository,
                passwordEncoder
        ).run(null);

        ArgumentCaptor<UserAccount> userCaptor = ArgumentCaptor.forClass(UserAccount.class);
        verify(userAccountRepository).save(userCaptor.capture());
        UserAccount superAdmin = userCaptor.getValue();
        assertThat(superAdmin.getEmail()).isEqualTo("superadmin@cloudcampus.dev");
        assertThat(superAdmin.getRole()).isEqualTo(UserRole.SUPER_ADMIN);
        assertThat(superAdmin.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(superAdmin.getPasswordHash()).isEqualTo("encoded-super-admin-password");
    }

    @Test
    void neverBootstrapsSuperAdminInProductionProfile() {
        SuperAdminBootstrap bootstrap = new SuperAdminBootstrap(
                true,
                "superadmin@cloudcampus.dev",
                "SuperAdmin123!",
                "CloudCampus Super Admin",
                "CLOUDCAMPUS",
                environment("prod"),
                mock(TenantRepository.class),
                mock(UserAccountRepository.class),
                mock(PasswordEncoder.class)
        );

        assertThatThrownBy(() -> bootstrap.run(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not allowed in the prod profile");
    }

    @Test
    void skipsBootstrapWhenActiveSuperAdminAlreadyExists() {
        TenantRepository tenantRepository = mock(TenantRepository.class);
        UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
        UserAccount existingSuperAdmin = new UserAccount(
                new Tenant("CLOUDCAMPUS", "CloudCampus Platform"),
                "superadmin@cloudcampus.dev",
                "CloudCampus Super Admin",
                UserRole.SUPER_ADMIN
        );
        existingSuperAdmin.activate("hash", "CloudCampus Super Admin", java.time.Instant.now());
        when(userAccountRepository.findByEmailIgnoreCase("superadmin@cloudcampus.dev"))
                .thenReturn(List.of(existingSuperAdmin));

        new SuperAdminBootstrap(
                true,
                "superadmin@cloudcampus.dev",
                "SuperAdmin123!",
                "CloudCampus Super Admin",
                "CLOUDCAMPUS",
                environment("local"),
                tenantRepository,
                userAccountRepository,
                mock(PasswordEncoder.class)
        ).run(null);

        verify(userAccountRepository, never()).save(any(UserAccount.class));
    }

    private MockEnvironment environment(String profile) {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles(profile);
        return environment;
    }
}
