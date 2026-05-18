package com.cloudcampus.experience.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.experience.dto.request.WebsiteNavigationCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteNavigationUpdateRequest;
import com.cloudcampus.experience.dto.request.WebsitePageCreateRequest;
import com.cloudcampus.experience.dto.request.WebsitePageUpdateRequest;
import com.cloudcampus.experience.dto.request.WebsiteSectionCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteSectionUpdateRequest;
import com.cloudcampus.experience.dto.request.WebsiteSeoUpsertRequest;
import com.cloudcampus.experience.dto.request.WebsiteThemeCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteThemeUpdateRequest;
import com.cloudcampus.experience.dto.response.DemoScenarioResponse;
import com.cloudcampus.experience.dto.response.InvestorRoomResponse;
import com.cloudcampus.experience.dto.response.PublicWebsiteDashboardResponse;
import com.cloudcampus.experience.dto.response.WebsiteNavigationResponse;
import com.cloudcampus.experience.dto.response.WebsitePageResponse;
import com.cloudcampus.experience.dto.response.WebsitePublishSnapshotResponse;
import com.cloudcampus.experience.dto.response.WebsiteSectionResponse;
import com.cloudcampus.experience.dto.response.WebsiteSeoSettingsResponse;
import com.cloudcampus.experience.dto.response.WebsiteThemeResponse;
import com.cloudcampus.experience.service.BrandingService;
import com.cloudcampus.experience.service.ContentBlockService;
import com.cloudcampus.experience.service.DemoOrchestrationService;
import com.cloudcampus.experience.service.InvestorRoomService;
import com.cloudcampus.experience.service.PageBuilderService;
import com.cloudcampus.experience.service.PublicWebsiteService;
import com.cloudcampus.experience.service.PublishService;
import com.cloudcampus.experience.service.SeoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/super-admin/public-website")
@Tag(name = "Super Admin — Public Website", description = "Manage CloudCampus global public website")
public class SuperAdminPublicWebsiteController {

    private final PublicWebsiteService publicWebsiteService;
    private final PageBuilderService pageBuilderService;
    private final BrandingService brandingService;
    private final SeoService seoService;
    private final PublishService publishService;
    private final ContentBlockService contentBlockService;
    private final DemoOrchestrationService demoService;
    private final InvestorRoomService investorRoomService;

    public SuperAdminPublicWebsiteController(PublicWebsiteService publicWebsiteService,
                                             PageBuilderService pageBuilderService,
                                             BrandingService brandingService,
                                             SeoService seoService,
                                             PublishService publishService,
                                             ContentBlockService contentBlockService,
                                             DemoOrchestrationService demoService,
                                             InvestorRoomService investorRoomService) {
        this.publicWebsiteService = publicWebsiteService;
        this.pageBuilderService = pageBuilderService;
        this.brandingService = brandingService;
        this.seoService = seoService;
        this.publishService = publishService;
        this.contentBlockService = contentBlockService;
        this.demoService = demoService;
        this.investorRoomService = investorRoomService;
    }

    @Operation(summary = "Website dashboard")
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<PublicWebsiteDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(null, publicWebsiteService.dashboard()));
    }

    @GetMapping("/pages")
    public ResponseEntity<ApiResponse<List<WebsitePageResponse>>> pages() {
        return ResponseEntity.ok(ApiResponse.ok(null, pageBuilderService.listPages()));
    }

    @PostMapping("/pages")
    public ResponseEntity<ApiResponse<WebsitePageResponse>> createPage(
            @RequestBody WebsitePageCreateRequest req,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID actorId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, pageBuilderService.createPage(req, actorId)));
    }

    @PutMapping("/pages/{id}")
    public ResponseEntity<ApiResponse<WebsitePageResponse>> updatePage(
            @PathVariable UUID id,
            @RequestBody WebsitePageUpdateRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.ok(null, pageBuilderService.updatePage(id, req)));
    }

    @PostMapping("/pages/{id}/publish")
    public ResponseEntity<ApiResponse<WebsitePageResponse>> publishPage(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, pageBuilderService.publishPage(id)));
    }

    @GetMapping("/pages/{id}/sections")
    public ResponseEntity<ApiResponse<List<WebsiteSectionResponse>>> sections(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, pageBuilderService.listSections(id)));
    }

    @PostMapping("/pages/{id}/sections")
    public ResponseEntity<ApiResponse<WebsiteSectionResponse>> createSection(
            @PathVariable UUID id,
            @RequestBody WebsiteSectionCreateRequest req,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID actorId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, pageBuilderService.createSection(id, req, actorId)));
    }

    @PutMapping("/sections/{sectionId}")
    public ResponseEntity<ApiResponse<WebsiteSectionResponse>> updateSection(
            @PathVariable UUID sectionId,
            @RequestBody WebsiteSectionUpdateRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.ok(null, pageBuilderService.updateSection(sectionId, req)));
    }

    @PostMapping("/sections/{sectionId}/publish")
    public ResponseEntity<ApiResponse<WebsiteSectionResponse>> publishSection(@PathVariable UUID sectionId) {
        return ResponseEntity.ok(ApiResponse.ok(null, pageBuilderService.publishSection(sectionId)));
    }

    @GetMapping("/navigation")
    public ResponseEntity<ApiResponse<List<WebsiteNavigationResponse>>> navigation() {
        return ResponseEntity.ok(ApiResponse.ok(null, pageBuilderService.listNavigation()));
    }

    @PostMapping("/navigation")
    public ResponseEntity<ApiResponse<WebsiteNavigationResponse>> createNavigation(
            @RequestBody WebsiteNavigationCreateRequest req,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID actorId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, pageBuilderService.createNavigation(req, actorId)));
    }

    @PutMapping("/navigation/{id}")
    public ResponseEntity<ApiResponse<WebsiteNavigationResponse>> updateNavigation(
            @PathVariable UUID id,
            @RequestBody WebsiteNavigationUpdateRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.ok(null, pageBuilderService.updateNavigation(id, req)));
    }

    @PostMapping("/navigation/{id}/publish")
    public ResponseEntity<ApiResponse<WebsiteNavigationResponse>> publishNavigation(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, pageBuilderService.publishNavigation(id)));
    }

    @GetMapping("/branding/themes")
    public ResponseEntity<ApiResponse<List<WebsiteThemeResponse>>> themes() {
        return ResponseEntity.ok(ApiResponse.ok(null, brandingService.listThemes()));
    }

    @PostMapping("/branding/themes")
    public ResponseEntity<ApiResponse<WebsiteThemeResponse>> createTheme(
            @RequestBody WebsiteThemeCreateRequest req,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID actorId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, brandingService.createTheme(req, actorId)));
    }

    @PutMapping("/branding/themes/{id}")
    public ResponseEntity<ApiResponse<WebsiteThemeResponse>> updateTheme(
            @PathVariable UUID id,
            @RequestBody WebsiteThemeUpdateRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.ok(null, brandingService.updateTheme(id, req)));
    }

    @PostMapping("/branding/themes/{id}/publish")
    public ResponseEntity<ApiResponse<WebsiteThemeResponse>> publishTheme(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, brandingService.publishTheme(id)));
    }

    @GetMapping("/seo")
    public ResponseEntity<ApiResponse<?>> seo(@RequestParam(required = false) String routePath) {
        if (routePath == null || routePath.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(null, seoService.listAll()));
        }
        return ResponseEntity.ok(ApiResponse.ok(null, seoService.getByRoute(routePath, false)));
    }

    @PutMapping("/seo")
    public ResponseEntity<ApiResponse<WebsiteSeoSettingsResponse>> upsertSeo(@RequestBody WebsiteSeoUpsertRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(null, seoService.upsert(req)));
    }

    @PostMapping("/seo/publish")
    public ResponseEntity<ApiResponse<WebsiteSeoSettingsResponse>> publishSeo(@RequestParam String routePath) {
        return ResponseEntity.ok(ApiResponse.ok(null, seoService.publish(routePath)));
    }

    @GetMapping("/content-blocks")
    public ResponseEntity<ApiResponse<?>> contentBlocks() {
        return ResponseEntity.ok(ApiResponse.ok(null, contentBlockService.listGlobal()));
    }

    @GetMapping("/media")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> media() {
        List<Map<String, String>> placeholders = List.of(
                Map.of("name", "hero-enterprise.jpg", "bucket", "public-assets", "status", "AVAILABLE"),
                Map.of("name", "ai-dashboard.mp4", "bucket", "public-assets", "status", "AVAILABLE")
        );
        return ResponseEntity.ok(ApiResponse.ok(null, placeholders));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<PublicWebsiteDashboardResponse>> analytics() {
        return ResponseEntity.ok(ApiResponse.ok(null, publicWebsiteService.dashboard()));
    }

    @GetMapping("/demo-showcase")
    public ResponseEntity<ApiResponse<List<DemoScenarioResponse>>> demoShowcase() {
        return ResponseEntity.ok(ApiResponse.ok(null, demoService.listActiveScenarios()));
    }

    @GetMapping("/investor-showcase")
    public ResponseEntity<ApiResponse<List<InvestorRoomResponse>>> investorShowcase() {
        return ResponseEntity.ok(ApiResponse.ok(null, investorRoomService.listActive()));
    }

    @PostMapping("/publish")
    public ResponseEntity<ApiResponse<WebsitePublishSnapshotResponse>> publish(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID actorId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, publishService.publishAll(actorId)));
    }

    @PostMapping("/publish/rollback/{snapshotId}")
    public ResponseEntity<ApiResponse<WebsitePublishSnapshotResponse>> rollback(@PathVariable UUID snapshotId) {
        return ResponseEntity.ok(ApiResponse.ok(null, publishService.rollback(snapshotId)));
    }

    @GetMapping("/publish/snapshots")
    public ResponseEntity<ApiResponse<List<WebsitePublishSnapshotResponse>>> snapshots() {
        return ResponseEntity.ok(ApiResponse.ok(null, publishService.snapshots()));
    }
}
