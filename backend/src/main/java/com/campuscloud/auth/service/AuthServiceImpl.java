package com.campuscloud.auth.service;

import com.campuscloud.auth.dto.LoginRequest;
import com.campuscloud.auth.dto.LoginResponse;
import com.campuscloud.auth.dto.UserProfileResponse;
import com.campuscloud.auth.security.CampusUserDetails;
import com.campuscloud.tenant.service.TenantContext;
import com.campuscloud.user.entity.UserAccount;
import com.campuscloud.user.entity.UserRole;
import com.campuscloud.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserAccountRepository userAccountRepository;

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        if (!(userDetails instanceof CampusUserDetails campus)) {
            throw new IllegalStateException("Unexpected principal type");
        }

        String primaryRole = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .sorted(Comparator.naturalOrder())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Authenticated user has no roles"));

        validateTenantRequirements(primaryRole);

        String token = jwtService.generateAccessToken(userDetails);
        Set<String> roles = userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toSet());

        String tenantId = "SUPER_ADMIN".equals(primaryRole)
                ? TenantContext.DEFAULT_SCHEMA
                : TenantContext.getTenant();

        return new LoginResponse(
                token,
                "Bearer",
                jwtService.getAccessTokenExpirationSeconds(),
                userDetails.getUsername(),
                primaryRole,
                roles,
                campus.getUserId(),
                tenantId
        );
    }

    @Override
    public UserProfileResponse currentProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CampusUserDetails campus)) {
            throw new IllegalStateException("Not authenticated");
        }
        if (campus.getUserId() == null) {
            return new UserProfileResponse(
                    null,
                    campus.getUsername(),
                    campus.getEmail() != null ? campus.getEmail() : "",
                    campus.getFullName(),
                    UserRole.SUPER_ADMIN,
                    true,
                    campus.getTenantSchema()
            );
        }
        UserAccount user = userAccountRepository.findById(campus.getUserId())
                .orElseThrow(() -> new IllegalStateException("User record not found"));
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isActive(),
                TenantContext.getTenant()
        );
    }

    private void validateTenantRequirements(String primaryRole) {
        if (!"SUPER_ADMIN".equals(primaryRole)
                && com.campuscloud.tenant.service.TenantContext.DEFAULT_SCHEMA.equals(
                com.campuscloud.tenant.service.TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-ID header is required for non-super-admin login");
        }
    }
}
