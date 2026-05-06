package com.cloudcampus.cms.controller;

import com.cloudcampus.cms.dto.AdmissionLeadRequest;
import com.cloudcampus.cms.dto.AdmissionLeadResponse;
import com.cloudcampus.cms.dto.PublicWebsiteResponse;
import com.cloudcampus.cms.service.WebsiteCmsService;
import com.cloudcampus.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public-facing website endpoints — no authentication required.
 * Visitors reach a school via its slug: GET /api/v1/website/{slug}
 */
@RestController
@RequestMapping("/api/v1/website")
@RequiredArgsConstructor
@Tag(name = "Public Website", description = "Public school website APIs (no auth)")
public class PublicWebsiteController {

    private final WebsiteCmsService cmsService;

    @GetMapping("/{slug}")
    @Operation(summary = "Get full public website data for a school by its slug")
    public ResponseEntity<ApiResponse<PublicWebsiteResponse>> getWebsite(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success("Website fetched", cmsService.getPublicWebsite(slug)));
    }

    @PostMapping("/{slug}/leads")
    @Operation(summary = "Submit an admission enquiry for a school")
    public ResponseEntity<ApiResponse<AdmissionLeadResponse>> submitLead(
            @PathVariable String slug,
            @Valid @RequestBody AdmissionLeadRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Enquiry submitted", cmsService.submitLead(slug, request)));
    }
}
