package com.cloudcampus.identity.auth.session;

import java.util.List;

import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.UnauthorizedException;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;
import com.cloudcampus.platform.tenant.TenantStatus;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AuthenticatedUserResolver {

    private final JwtAccessTokenService jwtAccessTokenService;
    private final RevokedAccessTokenRepository revokedAccessTokenRepository;
    private final SessionTokenService sessionTokenService;
    private final UserAccountRepository userAccountRepository;
    private final UserSchoolAccessRepository userSchoolAccessRepository;

    public AuthenticatedUserResolver(
            JwtAccessTokenService jwtAccessTokenService,
            RevokedAccessTokenRepository revokedAccessTokenRepository,
            SessionTokenService sessionTokenService,
            UserAccountRepository userAccountRepository,
            UserSchoolAccessRepository userSchoolAccessRepository
    ) {
        this.jwtAccessTokenService = jwtAccessTokenService;
        this.revokedAccessTokenRepository = revokedAccessTokenRepository;
        this.sessionTokenService = sessionTokenService;
        this.userAccountRepository = userAccountRepository;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
    }

    @Transactional(readOnly = true)
    public AuthenticatedUser requireUser(HttpServletRequest request) {
        String token = extractBearerToken(request);
        if (revokedAccessTokenRepository.existsByTokenHash(sessionTokenService.hash(token))) {
            throw new UnauthorizedException("Access token has been revoked.");
        }
        AuthTokenClaims claims = jwtAccessTokenService.verify(token);
        UserAccount user = userAccountRepository.findById(claims.userId())
                .orElseThrow(() -> new UnauthorizedException("Authenticated user was not found."));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("Authenticated user is not active.");
        }
        if (user.getTenant().getStatus() != TenantStatus.ACTIVE) {
            throw new ForbiddenException("Authenticated user's tenant is not active.");
        }
        if (!user.getTenant().getId().equals(claims.tenantId()) || user.getRole() != claims.role()) {
            throw new UnauthorizedException("Access token identity no longer matches the user.");
        }

        String activeSchoolId = resolveActiveSchoolId(user, claims.activeSchoolId());
        return new AuthenticatedUser(user, activeSchoolId);
    }

    public String extractBearerToken(HttpServletRequest request) {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new UnauthorizedException("Bearer access token is required.");
        }
        String token = authorization.substring("Bearer ".length()).trim();
        if (token.isBlank()) {
            throw new UnauthorizedException("Bearer access token is required.");
        }
        return token;
    }

    private String resolveActiveSchoolId(UserAccount user, String requestedActiveSchoolId) {
        if (isNonWorkspaceSessionRole(user.getRole())) {
            return null;
        }
        List<UserSchoolAccess> accessList = tenantConsistentAccessList(user);
        if (accessList.isEmpty()) {
            return null;
        }
        if (requestedActiveSchoolId != null) {
            return accessList.stream()
                    .filter(access -> access.getSchool().getId().equals(requestedActiveSchoolId))
                    .findFirst()
                    .map(access -> access.getSchool().getId())
                    .orElseGet(() -> firstGrantedSchoolId(accessList));
        }
        return firstGrantedSchoolId(accessList);
    }

    private String firstGrantedSchoolId(List<UserSchoolAccess> accessList) {
        return accessList.stream()
                .filter(UserSchoolAccess::isPrimaryAccess)
                .findFirst()
                .or(() -> accessList.stream().findFirst())
                .map(access -> access.getSchool().getId())
                .orElse(null);
    }

    private List<UserSchoolAccess> tenantConsistentAccessList(UserAccount user) {
        String tenantId = user.getTenant().getId();
        return userSchoolAccessRepository.findByUserId(user.getId())
                .stream()
                .filter(access -> access.getTenant().getId().equals(tenantId))
                .filter(access -> access.getSchool().getTenant().getId().equals(tenantId))
                .toList();
    }

    private boolean isNonWorkspaceSessionRole(UserRole role) {
        return role == UserRole.GUEST || role == UserRole.SYSTEM || role == UserRole.AI_AGENT;
    }
}
