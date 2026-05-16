package com.cloudcampus.website.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.repository.TenantRepository;
import com.cloudcampus.website.dto.PageResponse;
import com.cloudcampus.website.dto.PageWithSectionsResponse;
import com.cloudcampus.website.dto.PublicSiteResponse;
import com.cloudcampus.website.dto.SectionResponse;
import com.cloudcampus.website.service.WebsiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public-facing website renderer — no authentication required (CC-2002/2003).
 *
 * GET /v1/public/sites/{tenantCode}              — full site (pages + nav)
 * GET /v1/public/sites/{tenantCode}/pages/{slug} — single page with sections
 */
@RestController
@RequestMapping("/v1/public/sites")
@SecurityRequirements
@Tag(name = "Public — Sites", description = "School public website content, no auth required")
public class PublicSiteController {

    private final TenantRepository tenantRepo;
    private final SchoolRepository schoolRepo;
    private final WebsiteService   websiteService;

    public PublicSiteController(TenantRepository tenantRepo,
                                SchoolRepository schoolRepo,
                                WebsiteService websiteService) {
        this.tenantRepo    = tenantRepo;
        this.schoolRepo    = schoolRepo;
        this.websiteService = websiteService;
    }

    @Operation(summary = "Get public site (pages list + nav)")
    @GetMapping("/{tenantCode}")
    public ResponseEntity<ApiResponse<PublicSiteResponse>> getSite(
            @PathVariable String tenantCode) {
        School school = resolveSchool(tenantCode);
        Tenant tenant = tenantRepo.findById(school.getTenantId())
                .orElseThrow(() -> new NotFoundException("Tenant not found"));
        PublicSiteResponse body = websiteService.getPublicSite(
                school.getId(), school.getName(), tenant.getCode());
        return ResponseEntity.ok(ApiResponse.ok(null, body));
    }

    @Operation(summary = "Get a single published page with its visible sections")
    @GetMapping("/{tenantCode}/pages/{slug}")
    public ResponseEntity<ApiResponse<PageWithSectionsResponse>> getPage(
            @PathVariable String tenantCode,
            @PathVariable String slug) {
        School school = resolveSchool(tenantCode);
        PageResponse page = websiteService.getPublicPage(school.getId(), slug);
        List<SectionResponse> sections = websiteService.getPublicSections(page.id());
        return ResponseEntity.ok(ApiResponse.ok(null,
                new PageWithSectionsResponse(page, sections)));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private School resolveSchool(String tenantCode) {
        Tenant tenant = tenantRepo.findByCode(tenantCode.toLowerCase())
                .orElseThrow(() -> new NotFoundException("Site not found"));
        return schoolRepo.findByTenantIdAndCode(tenant.getId(), "MAIN")
                .orElseThrow(() -> new NotFoundException("Site not found"));
    }
}
