package com.cloudcampus.experience.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.experience.dto.request.ContentBlockCreateRequest;
import com.cloudcampus.experience.dto.request.ContentBlockUpdateRequest;
import com.cloudcampus.experience.dto.request.InvestorRoomCreateRequest;
import com.cloudcampus.experience.dto.request.MarketingCampaignCreateRequest;
import com.cloudcampus.experience.dto.request.MarketingCampaignUpdateRequest;
import com.cloudcampus.experience.dto.request.PresentationCreateRequest;
import com.cloudcampus.experience.dto.request.StorySceneCreateRequest;
import com.cloudcampus.experience.dto.request.StorySceneUpdateRequest;
import com.cloudcampus.experience.dto.request.TrustModuleCreateRequest;
import com.cloudcampus.experience.dto.request.TrustModuleUpdateRequest;
import com.cloudcampus.experience.dto.request.BrandSystemCreateRequest;
import com.cloudcampus.experience.dto.request.BrandSystemUpdateRequest;
import com.cloudcampus.experience.dto.request.StakeholderJourneyCreateRequest;
import com.cloudcampus.experience.dto.request.StakeholderJourneyUpdateRequest;
import com.cloudcampus.experience.dto.request.WebsiteTemplateCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteTemplateUpdateRequest;
import com.cloudcampus.experience.dto.request.WebsiteRouteCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteRouteUpdateRequest;
import com.cloudcampus.experience.dto.response.BrandSystemResponse;
import com.cloudcampus.experience.dto.response.ContentBlockResponse;
import com.cloudcampus.experience.dto.response.DemoScenarioResponse;
import com.cloudcampus.experience.dto.response.ExperienceSeedHealthResponse;
import com.cloudcampus.experience.dto.response.InvestorRoomResponse;
import com.cloudcampus.experience.dto.response.MarketingCampaignResponse;
import com.cloudcampus.experience.dto.response.PresentationResponse;
import com.cloudcampus.experience.dto.response.StorySceneResponse;
import com.cloudcampus.experience.dto.response.StakeholderJourneyResponse;
import com.cloudcampus.experience.dto.response.TrustModuleResponse;
import com.cloudcampus.experience.dto.response.WebsiteTemplateResponse;
import com.cloudcampus.experience.dto.response.WebsiteRouteResponse;
import com.cloudcampus.experience.service.BrandSystemService;
import com.cloudcampus.experience.service.ContentBlockService;
import com.cloudcampus.experience.service.DemoOrchestrationService;
import com.cloudcampus.experience.service.ExperienceSeedHealthService;
import com.cloudcampus.experience.service.InvestorRoomService;
import com.cloudcampus.experience.service.MarketingCampaignService;
import com.cloudcampus.experience.service.PresentationService;
import com.cloudcampus.experience.service.StorySceneService;
import com.cloudcampus.experience.service.StakeholderJourneyService;
import com.cloudcampus.experience.service.TrustModuleService;
import com.cloudcampus.experience.service.WebsiteTemplateService;
import com.cloudcampus.experience.service.WebsiteRouteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Super Admin control center for the Experience Platform.
 * All endpoints require SUPER_ADMIN role (enforced by SecurityConfig path matcher).
 */
@RestController
@RequestMapping("/v1/super-admin/experience")
@Tag(name = "Super Admin — Experience", description = "DSEP content management: blocks, demos, investor rooms, presentations")
public class SuperAdminExperienceController {

    private final BrandSystemService      brandSystemService;
    private final ContentBlockService      contentBlockService;
    private final DemoOrchestrationService demoService;
    private final InvestorRoomService      investorRoomService;
    private final PresentationService      presentationService;
    private final WebsiteRouteService      websiteRouteService;
    private final StakeholderJourneyService stakeholderJourneyService;
    private final ExperienceSeedHealthService seedHealthService;
    private final MarketingCampaignService marketingCampaignService;
    private final WebsiteTemplateService websiteTemplateService;
    private final StorySceneService storySceneService;
    private final TrustModuleService trustModuleService;

    public SuperAdminExperienceController(BrandSystemService brandSystemService,
                                          ContentBlockService contentBlockService,
                                          DemoOrchestrationService demoService,
                                          InvestorRoomService investorRoomService,
                                          PresentationService presentationService,
                                          WebsiteRouteService websiteRouteService,
                                          StakeholderJourneyService stakeholderJourneyService,
                                          ExperienceSeedHealthService seedHealthService,
                                          MarketingCampaignService marketingCampaignService,
                                          WebsiteTemplateService websiteTemplateService,
                                          StorySceneService storySceneService,
                                          TrustModuleService trustModuleService) {
        this.brandSystemService = brandSystemService;
        this.contentBlockService = contentBlockService;
        this.demoService         = demoService;
        this.investorRoomService = investorRoomService;
        this.presentationService = presentationService;
        this.websiteRouteService = websiteRouteService;
        this.stakeholderJourneyService = stakeholderJourneyService;
        this.seedHealthService = seedHealthService;
        this.marketingCampaignService = marketingCampaignService;
        this.websiteTemplateService = websiteTemplateService;
        this.storySceneService = storySceneService;
        this.trustModuleService = trustModuleService;
    }

    @Operation(summary = "Experience seed health", description = "Returns readiness checks for Experience Studio baseline data")
    @GetMapping("/seed-health")
    public ResponseEntity<ApiResponse<ExperienceSeedHealthResponse>> seedHealth() {
        return ResponseEntity.ok(ApiResponse.ok(null, seedHealthService.evaluate()));
    }

    // ── Branding Systems ─────────────────────────────────────────────────────

    @Operation(summary = "List brand systems")
    @GetMapping("/branding")
    public ResponseEntity<ApiResponse<List<BrandSystemResponse>>> listBrandSystems() {
        return ResponseEntity.ok(ApiResponse.ok(null, brandSystemService.listAll()));
    }

    @Operation(summary = "Create brand system")
    @PostMapping("/branding")
    public ResponseEntity<ApiResponse<BrandSystemResponse>> createBrandSystem(
            @RequestBody BrandSystemCreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        UUID actorId = UUID.fromString(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, brandSystemService.create(req, actorId)));
    }

    @Operation(summary = "Update brand system")
    @PutMapping("/branding/{id}")
    public ResponseEntity<ApiResponse<BrandSystemResponse>> updateBrandSystem(
            @PathVariable UUID id,
            @RequestBody BrandSystemUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(null, brandSystemService.update(id, req)));
    }

    @Operation(summary = "Publish brand system")
    @PostMapping("/branding/{id}/publish")
    public ResponseEntity<ApiResponse<BrandSystemResponse>> publishBrandSystem(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, brandSystemService.publish(id)));
    }

    // ── Content Blocks ────────────────────────────────────────────────────────

    @Operation(summary = "List all global content blocks")
    @GetMapping("/content-blocks")
    public ResponseEntity<ApiResponse<List<ContentBlockResponse>>> listBlocks() {
        return ResponseEntity.ok(ApiResponse.ok(null, contentBlockService.listGlobal()));
    }

    @Operation(summary = "Create a new content block (draft)")
    @PostMapping("/content-blocks")
    public ResponseEntity<ApiResponse<ContentBlockResponse>> createBlock(
            @RequestBody ContentBlockCreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        UUID actorId = UUID.fromString(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, contentBlockService.create(req, actorId)));
    }

    @Operation(summary = "Update content block content (stays as draft)")
    @PutMapping("/content-blocks/{id}")
    public ResponseEntity<ApiResponse<ContentBlockResponse>> updateBlock(
            @PathVariable UUID id,
            @RequestBody ContentBlockUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(null, contentBlockService.update(id, req)));
    }

    @Operation(summary = "Publish a draft content block (makes it live)")
    @PostMapping("/content-blocks/{id}/publish")
    public ResponseEntity<ApiResponse<ContentBlockResponse>> publishBlock(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, contentBlockService.publish(id)));
    }

    // ── Website Routes ───────────────────────────────────────────────────────

    @Operation(summary = "List website routes")
    @GetMapping("/website-routes")
    public ResponseEntity<ApiResponse<List<WebsiteRouteResponse>>> listWebsiteRoutes() {
        return ResponseEntity.ok(ApiResponse.ok(null, websiteRouteService.listAll()));
    }

    @Operation(summary = "Create website route")
    @PostMapping("/website-routes")
    public ResponseEntity<ApiResponse<WebsiteRouteResponse>> createWebsiteRoute(
            @RequestBody WebsiteRouteCreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        UUID actorId = UUID.fromString(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, websiteRouteService.create(req, actorId)));
    }

    @Operation(summary = "Update website route")
    @PutMapping("/website-routes/{id}")
    public ResponseEntity<ApiResponse<WebsiteRouteResponse>> updateWebsiteRoute(
            @PathVariable UUID id,
            @RequestBody WebsiteRouteUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(null, websiteRouteService.update(id, req)));
    }

    @Operation(summary = "Publish website route")
    @PostMapping("/website-routes/{id}/publish")
    public ResponseEntity<ApiResponse<WebsiteRouteResponse>> publishWebsiteRoute(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, websiteRouteService.publish(id)));
    }

    // ── Demo Scenarios ────────────────────────────────────────────────────────

    @Operation(summary = "List all demo scenarios")
    @GetMapping("/demo-scenarios")
    public ResponseEntity<ApiResponse<List<DemoScenarioResponse>>> listScenarios() {
        return ResponseEntity.ok(ApiResponse.ok(null, demoService.listActiveScenarios()));
    }

    // ── Investor Rooms ────────────────────────────────────────────────────────

    @Operation(summary = "List all active investor rooms")
    @GetMapping("/investor-rooms")
    public ResponseEntity<ApiResponse<List<InvestorRoomResponse>>> listRooms() {
        return ResponseEntity.ok(ApiResponse.ok(null, investorRoomService.listActive()));
    }

    @Operation(summary = "Create a new investor room")
    @PostMapping("/investor-rooms")
    public ResponseEntity<ApiResponse<InvestorRoomResponse>> createRoom(
            @RequestBody InvestorRoomCreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        UUID actorId = UUID.fromString(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, investorRoomService.create(req, actorId)));
    }

    @Operation(summary = "Archive an investor room")
    @DeleteMapping("/investor-rooms/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> archiveRoom(@PathVariable UUID id) {
        investorRoomService.regenerateCode(id);
        return ResponseEntity.ok(ApiResponse.ok(null, Map.of("status", "archived")));
    }

    // ── Presentations ─────────────────────────────────────────────────────────

    @Operation(summary = "List all presentations")
    @GetMapping("/presentations")
    public ResponseEntity<ApiResponse<List<PresentationResponse>>> listPresentations() {
        return ResponseEntity.ok(ApiResponse.ok(null, presentationService.listAll()));
    }

    @Operation(summary = "Create presentation")
    @PostMapping("/presentations")
    public ResponseEntity<ApiResponse<PresentationResponse>> createPresentation(
            @RequestBody PresentationCreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        UUID actorId = UUID.fromString(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, presentationService.create(req.title(), req.slug(), req.audienceType(), actorId)));
    }

    @Operation(summary = "Publish a presentation (makes it publicly viewable)")
    @PostMapping("/presentations/{id}/publish")
    public ResponseEntity<ApiResponse<PresentationResponse>> publishPresentation(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, presentationService.publish(id)));
    }

    // ── Stakeholder Journeys ────────────────────────────────────────────────

    @Operation(summary = "List stakeholder journeys")
    @GetMapping("/stakeholder-journeys")
    public ResponseEntity<ApiResponse<List<StakeholderJourneyResponse>>> listStakeholderJourneys() {
        return ResponseEntity.ok(ApiResponse.ok(null, stakeholderJourneyService.listAll()));
    }

    @Operation(summary = "Create stakeholder journey")
    @PostMapping("/stakeholder-journeys")
    public ResponseEntity<ApiResponse<StakeholderJourneyResponse>> createStakeholderJourney(
            @RequestBody StakeholderJourneyCreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        UUID actorId = UUID.fromString(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, stakeholderJourneyService.create(req, actorId)));
    }

    @Operation(summary = "Update stakeholder journey")
    @PutMapping("/stakeholder-journeys/{id}")
    public ResponseEntity<ApiResponse<StakeholderJourneyResponse>> updateStakeholderJourney(
            @PathVariable UUID id,
            @RequestBody StakeholderJourneyUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(null, stakeholderJourneyService.update(id, req)));
    }

    @Operation(summary = "Publish stakeholder journey")
    @PostMapping("/stakeholder-journeys/{id}/publish")
    public ResponseEntity<ApiResponse<StakeholderJourneyResponse>> publishStakeholderJourney(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, stakeholderJourneyService.publish(id)));
    }

    // ── Marketing Campaigns ────────────────────────────────────────────────

    @Operation(summary = "List marketing campaigns")
    @GetMapping("/campaigns")
    public ResponseEntity<ApiResponse<List<MarketingCampaignResponse>>> listCampaigns() {
        return ResponseEntity.ok(ApiResponse.ok(null, marketingCampaignService.listAll()));
    }

    @Operation(summary = "Create marketing campaign")
    @PostMapping("/campaigns")
    public ResponseEntity<ApiResponse<MarketingCampaignResponse>> createCampaign(
            @RequestBody MarketingCampaignCreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        UUID actorId = UUID.fromString(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, marketingCampaignService.create(req, actorId)));
    }

    @Operation(summary = "Update marketing campaign")
    @PutMapping("/campaigns/{id}")
    public ResponseEntity<ApiResponse<MarketingCampaignResponse>> updateCampaign(
            @PathVariable UUID id,
            @RequestBody MarketingCampaignUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(null, marketingCampaignService.update(id, req)));
    }

    @Operation(summary = "Publish marketing campaign")
    @PostMapping("/campaigns/{id}/publish")
    public ResponseEntity<ApiResponse<MarketingCampaignResponse>> publishCampaign(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, marketingCampaignService.publish(id)));
    }

    @Operation(summary = "Pause marketing campaign")
    @PostMapping("/campaigns/{id}/pause")
    public ResponseEntity<ApiResponse<MarketingCampaignResponse>> pauseCampaign(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, marketingCampaignService.pause(id)));
    }

    // ── Template Marketplace ───────────────────────────────────────────────

    @Operation(summary = "List website templates")
    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<List<WebsiteTemplateResponse>>> listTemplates() {
        return ResponseEntity.ok(ApiResponse.ok(null, websiteTemplateService.listAll()));
    }

    @Operation(summary = "Create website template")
    @PostMapping("/templates")
    public ResponseEntity<ApiResponse<WebsiteTemplateResponse>> createTemplate(
            @RequestBody WebsiteTemplateCreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        UUID actorId = UUID.fromString(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, websiteTemplateService.create(req, actorId)));
    }

    @Operation(summary = "Update website template")
    @PutMapping("/templates/{id}")
    public ResponseEntity<ApiResponse<WebsiteTemplateResponse>> updateTemplate(
            @PathVariable UUID id,
            @RequestBody WebsiteTemplateUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(null, websiteTemplateService.update(id, req)));
    }

    @Operation(summary = "Publish website template")
    @PostMapping("/templates/{id}/publish")
    public ResponseEntity<ApiResponse<WebsiteTemplateResponse>> publishTemplate(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, websiteTemplateService.publish(id)));
    }

    // ── Storytelling Scenes ────────────────────────────────────────────────

    @Operation(summary = "List storytelling scenes")
    @GetMapping("/story-scenes")
    public ResponseEntity<ApiResponse<List<StorySceneResponse>>> listStoryScenes() {
        return ResponseEntity.ok(ApiResponse.ok(null, storySceneService.listAll()));
    }

    @Operation(summary = "Create storytelling scene")
    @PostMapping("/story-scenes")
    public ResponseEntity<ApiResponse<StorySceneResponse>> createStoryScene(
            @RequestBody StorySceneCreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        UUID actorId = UUID.fromString(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, storySceneService.create(req, actorId)));
    }

    @Operation(summary = "Update storytelling scene")
    @PutMapping("/story-scenes/{id}")
    public ResponseEntity<ApiResponse<StorySceneResponse>> updateStoryScene(
            @PathVariable UUID id,
            @RequestBody StorySceneUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(null, storySceneService.update(id, req)));
    }

    @Operation(summary = "Publish storytelling scene")
    @PostMapping("/story-scenes/{id}/publish")
    public ResponseEntity<ApiResponse<StorySceneResponse>> publishStoryScene(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, storySceneService.publish(id)));
    }

    // ── Trust Modules ──────────────────────────────────────────────────────

    @Operation(summary = "List trust modules")
    @GetMapping("/trust-modules")
    public ResponseEntity<ApiResponse<List<TrustModuleResponse>>> listTrustModules() {
        return ResponseEntity.ok(ApiResponse.ok(null, trustModuleService.listAll()));
    }

    @Operation(summary = "Create trust module")
    @PostMapping("/trust-modules")
    public ResponseEntity<ApiResponse<TrustModuleResponse>> createTrustModule(
            @RequestBody TrustModuleCreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        UUID actorId = UUID.fromString(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, trustModuleService.create(req, actorId)));
    }

    @Operation(summary = "Update trust module")
    @PutMapping("/trust-modules/{id}")
    public ResponseEntity<ApiResponse<TrustModuleResponse>> updateTrustModule(
            @PathVariable UUID id,
            @RequestBody TrustModuleUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(null, trustModuleService.update(id, req)));
    }

    @Operation(summary = "Publish trust module")
    @PostMapping("/trust-modules/{id}/publish")
    public ResponseEntity<ApiResponse<TrustModuleResponse>> publishTrustModule(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, trustModuleService.publish(id)));
    }
}
