package com.cloudcampus.user.service;

import com.cloudcampus.tenant.service.TenantContext;
import com.cloudcampus.user.dto.UserCreateRequest;
import com.cloudcampus.user.dto.UserResponse;
import com.cloudcampus.user.entity.UserAccount;
import com.cloudcampus.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        validateTenantContext();

        String normalizedUsername = request.username().trim().toLowerCase(Locale.ROOT);
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        if (userAccountRepository.existsByUsername(normalizedUsername)) {
            throw new IllegalArgumentException("Username already exists: " + normalizedUsername);
        }
        if (userAccountRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists: " + normalizedEmail);
        }

        UserAccount user = new UserAccount();
        user.setFullName(request.fullName().trim());
        user.setUsername(normalizedUsername);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setTenantId(TenantContext.getTenant());
        user.setActive(true);

        UserAccount saved = userAccountRepository.save(user);
        log.info("User created: username={}, role={}, tenant={}", saved.getUsername(), saved.getRole(), TenantContext.getTenant());
        return map(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(Pageable pageable) {
        validateTenantContext();
        return userAccountRepository.findAll(pageable).map(this::map);
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-Slug header is required for user operations");
        }
    }

    private UserResponse map(UserAccount user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
