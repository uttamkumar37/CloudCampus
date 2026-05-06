package com.cloudcampus.cms.controller;

import com.cloudcampus.cms.dto.*;
import com.cloudcampus.cms.service.WebsiteCmsService;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.tenant.repository.TenantRepository;
import com.cloudcampus.tenant.service.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * CMS management endpoints — authenticated as SCHOOL_ADMIN.
 * Tenant is resolved from the current TenantContext (schema name → logical tenantId).
 */
@RestController
@RequestMapping("/api/v1/cms")
@RequiredArgsConstructor
@Tag(name = "Website CMS", description = "School website builder APIs (SCHOOL_ADMIN)")
public class WebsiteCmsController {

    private final WebsiteCmsService cmsService;
    private final TenantRepository tenantRepository;

    // ---- Config ----

    @GetMapping("/config")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Get website config for current tenant")
    public ResponseEntity<ApiResponse<WebsiteConfigResponse>> getConfig() {
        return ResponseEntity.ok(ApiResponse.success("Config fetched", cmsService.getConfig(currentTenantId())));
    }

    @PutMapping("/config")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Create or update website config")
    public ResponseEntity<ApiResponse<WebsiteConfigResponse>> upsertConfig(
            @Valid @RequestBody WebsiteConfigRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Config saved", cmsService.upsertConfig(currentTenantId(), request)));
    }

    // ---- Sections ----

    @GetMapping("/sections")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "List all website sections for current tenant")
    public ResponseEntity<ApiResponse<List<WebsiteSectionResponse>>> getSections() {
        return ResponseEntity.ok(ApiResponse.success("Sections fetched", cmsService.getSections(currentTenantId())));
    }

    @PutMapping("/sections")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Create or update a website section")
    public ResponseEntity<ApiResponse<WebsiteSectionResponse>> upsertSection(
            @Valid @RequestBody WebsiteSectionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Section saved", cmsService.upsertSection(currentTenantId(), request)));
    }

    @DeleteMapping("/sections/{sectionKey}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Delete a website section by key")
    public ResponseEntity<ApiResponse<Void>> deleteSection(@PathVariable String sectionKey) {
        cmsService.deleteSection(currentTenantId(), sectionKey);
        return ResponseEntity.ok(ApiResponse.success("Section deleted", null));
    }

    // ---- Gallery ----

    @GetMapping("/gallery")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "List gallery items")
    public ResponseEntity<ApiResponse<List<GalleryItemResponse>>> getGallery() {
        return ResponseEntity.ok(ApiResponse.success("Gallery fetched", cmsService.getGallery(currentTenantId())));
    }

    @PostMapping("/gallery")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Add a gallery image")
    public ResponseEntity<ApiResponse<GalleryItemResponse>> addGalleryItem(
            @Valid @RequestBody GalleryItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Image added", cmsService.addGalleryItem(currentTenantId(), request)));
    }

    @DeleteMapping("/gallery/{itemId}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Delete a gallery image")
    public ResponseEntity<ApiResponse<Void>> deleteGalleryItem(@PathVariable UUID itemId) {
        cmsService.deleteGalleryItem(currentTenantId(), itemId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted", null));
    }

    // ---- Admission Leads ----

    @GetMapping("/leads")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "List admission leads (optionally filter by status)")
    public ResponseEntity<ApiResponse<List<AdmissionLeadResponse>>> getLeads(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success("Leads fetched", cmsService.getLeads(currentTenantId(), status)));
    }

    @PatchMapping("/leads/{leadId}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Update admission lead status and notes")
    public ResponseEntity<ApiResponse<AdmissionLeadResponse>> updateLead(
            @PathVariable UUID leadId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String notes = body.get("notes");
        return ResponseEntity.ok(ApiResponse.success("Lead updated",
                cmsService.updateLeadStatus(currentTenantId(), leadId, status, notes)));
    }

    // ---- Helpers ----

    private String currentTenantId() {
        String schemaName = TenantContext.getTenant();
        return tenantRepository.findBySchemaName(schemaName)
                .orElseThrow(() -> new IllegalStateException("Current tenant not found for schema: " + schemaName))
                .getTenantId();
    }
}
