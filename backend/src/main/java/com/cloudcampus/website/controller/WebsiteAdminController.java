package com.cloudcampus.website.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.website.dto.*;
import com.cloudcampus.website.service.WebsiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Website builder — school-admin management endpoints (CC-2001/2002/2003/2004).
 *
 * All routes are school-scoped via {schoolId} path variable.
 *
 * Website:   GET/PUT  /v1/school-admin/schools/{schoolId}/website
 * Pages:     CRUD     /v1/school-admin/schools/{schoolId}/website/pages
 * Sections:  CRUD     /v1/school-admin/schools/{schoolId}/website/pages/{pageId}/sections
 * Nav:       CRUD     /v1/school-admin/schools/{schoolId}/website/nav
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/website")
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
@Tag(name = "Website Builder", description = "Manage school public website pages, sections, and navigation")
public class WebsiteAdminController {

    private final WebsiteService websiteService;

    public WebsiteAdminController(WebsiteService websiteService) {
        this.websiteService = websiteService;
    }

    // ── Website root ──────────────────────────────────────────────────────────

    @Operation(summary = "Get or initialise the school website")
    @GetMapping
    public ResponseEntity<ApiResponse<WebsiteResponse>> getWebsite(@PathVariable UUID schoolId) {
        UUID tenantId = tenantId();
        WebsiteResponse body = websiteService.getOrCreateWebsite(tenantId, schoolId);
        return ok(body);
    }

    @Operation(summary = "Publish or unpublish the website")
    @PutMapping("/publish")
    public ResponseEntity<ApiResponse<WebsiteResponse>> setPublished(
            @PathVariable UUID schoolId,
            @RequestParam boolean published) {
        return ok(websiteService.setPublished(schoolId, published));
    }

    // ── Pages ─────────────────────────────────────────────────────────────────

    @Operation(summary = "List all pages")
    @GetMapping("/pages")
    public ResponseEntity<ApiResponse<List<PageResponse>>> listPages(@PathVariable UUID schoolId) {
        return ok(websiteService.listPages(schoolId));
    }

    @Operation(summary = "Create a page")
    @PostMapping("/pages")
    public ResponseEntity<ApiResponse<PageResponse>> createPage(
            @PathVariable UUID schoolId,
            @Valid @RequestBody PageRequest req) {
        return ok(websiteService.createPage(tenantId(), schoolId, req));
    }

    @Operation(summary = "Update a page")
    @PutMapping("/pages/{pageId}")
    public ResponseEntity<ApiResponse<PageResponse>> updatePage(
            @PathVariable UUID schoolId,
            @PathVariable UUID pageId,
            @Valid @RequestBody PageRequest req) {
        return ok(websiteService.updatePage(pageId, schoolId, req));
    }

    @Operation(summary = "Delete a page and its sections")
    @DeleteMapping("/pages/{pageId}")
    public ResponseEntity<Void> deletePage(
            @PathVariable UUID schoolId,
            @PathVariable UUID pageId) {
        websiteService.deletePage(pageId, schoolId);
        return ResponseEntity.noContent().build();
    }

    // ── Sections ──────────────────────────────────────────────────────────────

    @Operation(summary = "List sections of a page")
    @GetMapping("/pages/{pageId}/sections")
    public ResponseEntity<ApiResponse<List<SectionResponse>>> listSections(
            @PathVariable UUID schoolId,
            @PathVariable UUID pageId) {
        return ok(websiteService.listSections(pageId, schoolId));
    }

    @Operation(summary = "Add a section to a page")
    @PostMapping("/pages/{pageId}/sections")
    public ResponseEntity<ApiResponse<SectionResponse>> addSection(
            @PathVariable UUID schoolId,
            @PathVariable UUID pageId,
            @Valid @RequestBody SectionRequest req) {
        return ok(websiteService.addSection(tenantId(), pageId, schoolId, req));
    }

    @Operation(summary = "Update a section")
    @PutMapping("/pages/{pageId}/sections/{sectionId}")
    public ResponseEntity<ApiResponse<SectionResponse>> updateSection(
            @PathVariable UUID schoolId,
            @PathVariable UUID pageId,
            @PathVariable UUID sectionId,
            @Valid @RequestBody SectionRequest req) {
        return ok(websiteService.updateSection(sectionId, pageId, schoolId, req));
    }

    @Operation(summary = "Delete a section")
    @DeleteMapping("/pages/{pageId}/sections/{sectionId}")
    public ResponseEntity<Void> deleteSection(
            @PathVariable UUID schoolId,
            @PathVariable UUID pageId,
            @PathVariable UUID sectionId) {
        websiteService.deleteSection(sectionId, pageId, schoolId);
        return ResponseEntity.noContent().build();
    }

    // ── Navigation ────────────────────────────────────────────────────────────

    @Operation(summary = "List navigation items")
    @GetMapping("/nav")
    public ResponseEntity<ApiResponse<List<NavItemResponse>>> listNav(@PathVariable UUID schoolId) {
        return ok(websiteService.listNav(schoolId));
    }

    @Operation(summary = "Add a navigation item")
    @PostMapping("/nav")
    public ResponseEntity<ApiResponse<NavItemResponse>> addNavItem(
            @PathVariable UUID schoolId,
            @Valid @RequestBody NavItemRequest req) {
        return ok(websiteService.addNavItem(tenantId(), schoolId, req));
    }

    @Operation(summary = "Update a navigation item")
    @PutMapping("/nav/{itemId}")
    public ResponseEntity<ApiResponse<NavItemResponse>> updateNavItem(
            @PathVariable UUID schoolId,
            @PathVariable UUID itemId,
            @Valid @RequestBody NavItemRequest req) {
        return ok(websiteService.updateNavItem(itemId, schoolId, req));
    }

    @Operation(summary = "Delete a navigation item")
    @DeleteMapping("/nav/{itemId}")
    public ResponseEntity<Void> deleteNavItem(
            @PathVariable UUID schoolId,
            @PathVariable UUID itemId) {
        websiteService.deleteNavItem(itemId, schoolId);
        return ResponseEntity.noContent().build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private UUID tenantId() {
        String tid = RequestContext.getTenantId();
        return tid != null ? UUID.fromString(tid) : null;
    }

    private <T> ResponseEntity<ApiResponse<T>> ok(T body) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }
}
