package com.cloudcampus.experience.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.experience.dto.request.DemoStartRequest;
import com.cloudcampus.experience.dto.request.IngestEventsRequest;
import com.cloudcampus.experience.dto.response.ContentBlockResponse;
import com.cloudcampus.experience.dto.response.DemoScenarioResponse;
import com.cloudcampus.experience.dto.response.DemoSessionResponse;
import com.cloudcampus.experience.dto.response.MarketingCampaignResponse;
import com.cloudcampus.experience.dto.response.PublicRenderProfileResponse;
import com.cloudcampus.experience.dto.response.StorySceneResponse;
import com.cloudcampus.experience.dto.response.TrustModuleResponse;
import com.cloudcampus.experience.dto.response.WebsiteTemplateResponse;
import com.cloudcampus.experience.service.ContentBlockService;
import com.cloudcampus.experience.service.DemoOrchestrationService;
import com.cloudcampus.experience.service.ExperienceEventPublisher;
import com.cloudcampus.experience.service.ExperienceRenderProfileService;
import com.cloudcampus.experience.service.MarketingCampaignService;
import com.cloudcampus.experience.service.StorySceneService;
import com.cloudcampus.experience.service.TrustModuleService;
import com.cloudcampus.experience.service.WebsiteTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

/**
 * Public-facing Experience Platform endpoints — no authentication required.
 * All analytics writes are async (RabbitMQ); response time target <10ms.
 */
@RestController
@RequestMapping("/v1/experience/public")
@SecurityRequirements
@Tag(name = "Public — Experience", description = "DSEP public endpoints: content blocks, demo, investor room, analytics")
public class PublicExperienceController {

    private final ContentBlockService       contentBlockService;
    private final DemoOrchestrationService  demoService;
    private final ExperienceEventPublisher  eventPublisher;
    private final ExperienceRenderProfileService renderProfileService;
    private final WebsiteTemplateService templateService;
    private final StorySceneService storySceneService;
    private final TrustModuleService trustModuleService;
    private final MarketingCampaignService campaignService;

    public PublicExperienceController(ContentBlockService contentBlockService,
                                      DemoOrchestrationService demoService,
                                      ExperienceEventPublisher eventPublisher,
                                      ExperienceRenderProfileService renderProfileService,
                                      WebsiteTemplateService templateService,
                                      StorySceneService storySceneService,
                                      TrustModuleService trustModuleService,
                                      MarketingCampaignService campaignService) {
        this.contentBlockService = contentBlockService;
        this.demoService         = demoService;
        this.eventPublisher      = eventPublisher;
        this.renderProfileService = renderProfileService;
        this.templateService = templateService;
        this.storySceneService = storySceneService;
        this.trustModuleService = trustModuleService;
        this.campaignService = campaignService;
    }

    // ── Content Blocks ────────────────────────────────────────────────────────

    @Operation(summary = "Batch fetch published content blocks by keys")
    @GetMapping("/content-blocks")
    public ResponseEntity<ApiResponse<Map<String, ContentBlockResponse>>> getBlocks(
            @RequestParam List<String> keys,
            @RequestParam(defaultValue = "en") String locale) {
        Map<String, ContentBlockResponse> blocks = contentBlockService.getBlocks(keys, locale, null);
        return ResponseEntity.ok(ApiResponse.ok(null, blocks));
    }

    // ── Demo ──────────────────────────────────────────────────────────────────

    @Operation(summary = "List active demo scenarios")
    @GetMapping("/demo-scenarios")
    public ResponseEntity<ApiResponse<List<DemoScenarioResponse>>> listScenarios() {
        return ResponseEntity.ok(ApiResponse.ok(null, demoService.listActiveScenarios()));
    }

    @Operation(summary = "Start a self-serve demo session")
    @PostMapping("/demo/start")
    public ResponseEntity<ApiResponse<DemoSessionResponse>> startDemo(
            @RequestBody DemoStartRequest req) {
        DemoSessionResponse session = demoService.startSession(req);
        return ResponseEntity.ok(ApiResponse.ok(null, session));
    }

    @Operation(summary = "Validate an active demo session token")
    @GetMapping("/demo/session/{token}")
    public ResponseEntity<ApiResponse<DemoSessionResponse>> validateSession(
            @PathVariable String token) {
        return ResponseEntity.ok(ApiResponse.ok(null, demoService.validateSession(token)));
    }

    // ── Dynamic Render Profile ───────────────────────────────────────────────

    @Operation(summary = "Resolve dynamic render profile for audience/route")
    @GetMapping("/render-profile")
    public ResponseEntity<ApiResponse<PublicRenderProfileResponse>> renderProfile(
            @RequestParam String routePath,
            @RequestParam String audienceType,
            @RequestParam(required = false) String brandCode) {
        PublicRenderProfileResponse profile = renderProfileService.resolve(routePath, audienceType, brandCode);
        return ResponseEntity.ok(ApiResponse.ok(null, profile));
    }

    // ── Expansion Domain Reads ─────────────────────────────────────────────

    @Operation(summary = "List published website templates")
    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<List<WebsiteTemplateResponse>>> publishedTemplates() {
        return ResponseEntity.ok(ApiResponse.ok(null, templateService.listPublished()));
    }

    @Operation(summary = "List published story scenes")
    @GetMapping("/story-scenes")
    public ResponseEntity<ApiResponse<List<StorySceneResponse>>> publishedStoryScenes(
            @RequestParam(required = false) String audienceType) {
        return ResponseEntity.ok(ApiResponse.ok(null, storySceneService.listPublished(audienceType)));
    }

    @Operation(summary = "List published trust modules")
    @GetMapping("/trust-modules")
    public ResponseEntity<ApiResponse<List<TrustModuleResponse>>> publishedTrustModules() {
        return ResponseEntity.ok(ApiResponse.ok(null, trustModuleService.listPublished()));
    }

    @Operation(summary = "List active campaigns")
    @GetMapping("/campaigns")
    public ResponseEntity<ApiResponse<List<MarketingCampaignResponse>>> activeCampaigns() {
        return ResponseEntity.ok(ApiResponse.ok(null, campaignService.listActive()));
    }

    // ── Analytics Events ──────────────────────────────────────────────────────

    @Operation(summary = "Ingest batched analytics events (fire-and-forget)")
    @PostMapping("/events")
    public ResponseEntity<Void> ingestEvents(
            @RequestBody IngestEventsRequest req,
            HttpServletRequest httpRequest) {
        if (req.events() == null || req.events().isEmpty()) {
            return ResponseEntity.accepted().build();
        }
        String countryCode = httpRequest.getHeader("CF-IPCountry");
        String ipHash      = hashIp(httpRequest.getRemoteAddr());
        eventPublisher.publish(req.events(), countryCode, ipHash);
        return ResponseEntity.accepted().build();
    }

    // ── IP Privacy Helper ────────────────────────────────────────────────────

    private static String hashIp(String ip) {
        try {
            String salted = ip + ":" + LocalDate.now();
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(salted.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            return "unknown";
        }
    }
}
