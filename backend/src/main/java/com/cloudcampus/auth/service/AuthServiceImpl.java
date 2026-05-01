package com.cloudcampus.auth.service;

import com.cloudcampus.auth.dto.ChangePasswordRequest;
import com.cloudcampus.auth.dto.LoginRequest;
import com.cloudcampus.auth.dto.LoginResponse;
import com.cloudcampus.auth.dto.UserProfileResponse;
import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.tenant.dto.TenantResponse;
import com.cloudcampus.tenant.service.TenantService;
import com.cloudcampus.tenant.service.TenantContext;
import com.cloudcampus.user.entity.UserAccount;
import com.cloudcampus.user.entity.UserRole;
import com.cloudcampus.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantService tenantService;

    @Override
    public LoginResponse login(LoginRequest request) {
        TenantResponse tenant = resolveRequestedTenant(request);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        if (!(userDetails instanceof CloudCampusUserDetails)) {
            throw new IllegalStateException("Unexpected principal type");
        }

        Set<String> roleNames = userDetails.getAuthorities().stream()
            .map(authority -> authority.getAuthority().replace("ROLE_", ""))
            .collect(Collectors.toSet());

        String primaryRole = resolveSelectedRole(request.role(), roleNames);

        validateTenantRequirements(primaryRole, tenant);

        String token = jwtService.generateAccessToken(userDetails);
        Set<String> roles = userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toSet());

        return new LoginResponse(
                token,
                "Bearer",
                jwtService.getAccessTokenExpirationSeconds(),
                userDetails.getUsername(),
                primaryRole,
                roles,
                tenant != null ? tenant.slug() : null,
                tenant != null ? tenant.schoolName() : null
        );
    }

    @Override
    public UserProfileResponse currentProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CloudCampusUserDetails campus)) {
            throw new IllegalStateException("Not authenticated");
        }
        if (campus.getUserId() == null) {
            return new UserProfileResponse(
                    campus.getUsername(),
                    campus.getEmail() != null ? campus.getEmail() : "",
                    campus.getFullName(),
                    UserRole.SUPER_ADMIN,
                    true,
                null,
                "CloudCampus Platform"
            );
        }
        UserAccount user = userAccountRepository.findById(campus.getUserId())
                .orElseThrow(() -> new IllegalStateException("User record not found"));
        TenantResponse tenant = tenantService.getCurrentTenant();
        return new UserProfileResponse(
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isActive(),
            tenant.slug(),
            tenant.schoolName()
        );
    }

    private TenantResponse resolveRequestedTenant(LoginRequest request) {
        if (!StringUtils.hasText(request.tenantSlug())) {
            TenantContext.setTenant(TenantContext.DEFAULT_SCHEMA);
            return null;
        }

        TenantResponse tenant = tenantService.getTenantBySlug(request.tenantSlug());
        TenantContext.setTenant(tenant.schemaName());
        return tenant;
    }

    private String resolveSelectedRole(String requestedRole, Set<String> grantedRoles) {
        if (StringUtils.hasText(requestedRole)) {
            String normalizedRole = requestedRole.trim().toUpperCase(Locale.ROOT);
            if (!grantedRoles.contains(normalizedRole)) {
                throw new BadCredentialsException("The selected role is not available for this account");
            }
            return normalizedRole;
        }

        return grantedRoles.stream()
                .sorted(Comparator.naturalOrder())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Authenticated user has no roles"));
    }

    private void validateTenantRequirements(String primaryRole, TenantResponse tenant) {
        if (!"SUPER_ADMIN".equals(primaryRole)
                && tenant == null) {
            throw new IllegalArgumentException("A school must be selected for non-super-admin login");
        }
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CloudCampusUserDetails campus)) {
            throw new IllegalStateException("Not authenticated");
        }
        if (campus.getUserId() == null) {
            throw new IllegalArgumentException("Super-admin password change is not supported via this endpoint");
        }
        UserAccount user = userAccountRepository.findById(campus.getUserId())
                .orElseThrow(() -> new IllegalStateException("User record not found"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userAccountRepository.save(user);
    }
}
