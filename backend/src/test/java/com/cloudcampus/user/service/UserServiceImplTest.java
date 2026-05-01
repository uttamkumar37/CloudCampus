package com.cloudcampus.user.service;

import com.cloudcampus.tenant.service.TenantContext;
import com.cloudcampus.user.dto.UserCreateRequest;
import com.cloudcampus.user.dto.UserResponse;
import com.cloudcampus.user.entity.UserAccount;
import com.cloudcampus.user.entity.UserRole;
import com.cloudcampus.user.repository.UserAccountRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setTenantContext() {
        TenantContext.setTenant("school_a");
    }

    @AfterEach
    void clearTenantContext() {
        TenantContext.clear();
    }

    // ── createUser ────────────────────────────────────────────────────────────

    @Test
    void createUser_success() {
        UserCreateRequest request = new UserCreateRequest(
                "Alice Smith", "alice", "alice@example.com", "password1", UserRole.TEACHER);

        when(userAccountRepository.existsByUsername("alice")).thenReturn(false);
        when(userAccountRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password1")).thenReturn("hashed");

        UserAccount saved = buildUserAccount(UUID.randomUUID(), "Alice Smith", "alice", "alice@example.com",
                "hashed", UserRole.TEACHER);
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(saved);

        UserResponse response = userService.createUser(request);

        assertThat(response.username()).isEqualTo("alice");
        assertThat(response.email()).isEqualTo("alice@example.com");
        assertThat(response.role()).isEqualTo(UserRole.TEACHER);
        verify(passwordEncoder).encode("password1");
        verify(userAccountRepository).save(any(UserAccount.class));
    }

    @Test
    void createUser_normalizesUsernameAndEmail() {
        UserCreateRequest request = new UserCreateRequest(
                "Bob", "  BOB  ", "  BOB@Example.COM  ", "password1", UserRole.STUDENT);

        when(userAccountRepository.existsByUsername("bob")).thenReturn(false);
        when(userAccountRepository.existsByEmail("bob@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");

        UserAccount saved = buildUserAccount(UUID.randomUUID(), "Bob", "bob", "bob@example.com",
                "hashed", UserRole.STUDENT);
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(saved);

        UserResponse response = userService.createUser(request);

        assertThat(response.username()).isEqualTo("bob");
        assertThat(response.email()).isEqualTo("bob@example.com");
    }

    @Test
    void createUser_throwsWhenUsernameAlreadyExists() {
        UserCreateRequest request = new UserCreateRequest(
                "Alice", "alice", "alice@example.com", "password1", UserRole.TEACHER);

        when(userAccountRepository.existsByUsername("alice")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username already exists");
    }

    @Test
    void createUser_throwsWhenEmailAlreadyExists() {
        UserCreateRequest request = new UserCreateRequest(
                "Alice", "alice", "alice@example.com", "password1", UserRole.TEACHER);

        when(userAccountRepository.existsByUsername("alice")).thenReturn(false);
        when(userAccountRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already exists");
    }

    @Test
    void createUser_throwsWhenTenantIsPublicSchema() {
        TenantContext.setTenant(TenantContext.DEFAULT_SCHEMA);

        UserCreateRequest request = new UserCreateRequest(
                "Alice", "alice", "alice@example.com", "password1", UserRole.TEACHER);

        assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("X-Tenant-Slug header is required");
    }

    // ── getUsers ──────────────────────────────────────────────────────────────

    @Test
    void getUsers_returnsAllUsersInTenant() {
        UserAccount u1 = buildUserAccount(UUID.randomUUID(), "Alice", "alice", "alice@example.com",
                "h", UserRole.TEACHER);
        UserAccount u2 = buildUserAccount(UUID.randomUUID(), "Bob", "bob", "bob@example.com",
                "h", UserRole.STUDENT);
        Pageable pageable = PageRequest.of(0, 20);
        when(userAccountRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(u1, u2), pageable, 2));

        Page<UserResponse> result = userService.getUsers(pageable);

        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).extracting(UserResponse::username).containsExactly("alice", "bob");
    }

    @Test
    void getUsers_throwsWhenTenantIsPublicSchema() {
        TenantContext.setTenant(TenantContext.DEFAULT_SCHEMA);

        assertThatThrownBy(() -> userService.getUsers(PageRequest.of(0, 20)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("X-Tenant-Slug header is required");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private UserAccount buildUserAccount(UUID id, String fullName, String username, String email,
                                          String passwordHash, UserRole role) {
        UserAccount account = new UserAccount();
        account.setId(id);
        account.setFullName(fullName);
        account.setUsername(username);
        account.setEmail(email);
        account.setPasswordHash(passwordHash);
        account.setRole(role);
        account.setActive(true);
        account.setCreatedAt(Instant.now());
        return account;
    }
}
