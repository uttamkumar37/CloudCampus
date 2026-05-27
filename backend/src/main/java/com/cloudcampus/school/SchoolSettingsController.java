package com.cloudcampus.school;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SchoolSettingsController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final SchoolSettingsService schoolSettingsService;

    public SchoolSettingsController(
            AuthenticatedUserResolver authenticatedUserResolver,
            SchoolSettingsService schoolSettingsService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.schoolSettingsService = schoolSettingsService;
    }

    @GetMapping("/v1/school-admin/settings")
    ResponseEntity<SchoolSettingsResponse> get(HttpServletRequest request) {
        return ResponseEntity.ok(schoolSettingsService.get(authenticatedUserResolver.requireUser(request)));
    }

    @PatchMapping("/v1/school-admin/settings")
    ResponseEntity<SchoolSettingsResponse> update(
            @Valid @RequestBody SchoolSettingsRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(schoolSettingsService.update(authenticatedUserResolver.requireUser(request), requestBody));
    }
}
