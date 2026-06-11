package com.cloudcampus.identity.auth.session;

import java.util.List;

import com.cloudcampus.common.context.RequestContextResolver;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/me")
public class CurrentUserController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final RequestContextResolver requestContextResolver;
    private final AuthSessionService authSessionService;

    public CurrentUserController(
            AuthenticatedUserResolver authenticatedUserResolver,
            RequestContextResolver requestContextResolver,
            AuthSessionService authSessionService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.requestContextResolver = requestContextResolver;
        this.authSessionService = authSessionService;
    }

    @GetMapping
    ResponseEntity<CurrentUserResponse> currentUser(HttpServletRequest request) {
        return ResponseEntity.ok(authSessionService.currentUser(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/schools")
    ResponseEntity<List<SchoolAccessResponse>> schools(HttpServletRequest request) {
        return ResponseEntity.ok(authSessionService.allowedSchools(authenticatedUserResolver.requireUser(request)));
    }

    @PostMapping("/schools/{schoolId}/activate")
    ResponseEntity<AuthSessionResponse> activateSchool(
            @PathVariable String schoolId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(authSessionService.activateSchool(
                requestContextResolver.requireContext(request),
                schoolId
        ));
    }

    @PostMapping("/change-password")
    ResponseEntity<AuthMessageResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(authSessionService.changePassword(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @PostMapping("/logout")
    ResponseEntity<AuthMessageResponse> logout(
            @RequestBody(required = false) LogoutRequest requestBody,
            HttpServletRequest request
    ) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.requireUser(request);
        return ResponseEntity.ok(authSessionService.logout(
                authenticatedUser,
                authenticatedUserResolver.extractBearerToken(request),
                requestBody
        ));
    }
}
