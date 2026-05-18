package com.cloudcampus.experience.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.experience.dto.response.DemoScenarioResponse;
import com.cloudcampus.experience.dto.response.InvestorRoomResponse;
import com.cloudcampus.experience.dto.response.WebsiteNavigationResponse;
import com.cloudcampus.experience.dto.response.WebsiteThemeResponse;
import com.cloudcampus.experience.service.DemoOrchestrationService;
import com.cloudcampus.experience.service.InvestorRoomService;
import com.cloudcampus.experience.service.PublicWebsiteService;
import com.cloudcampus.experience.service.SeoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/v1/experience/public/website", "/v1/public/website"})
@SecurityRequirements
@Tag(name = "Public — Website", description = "CloudCampus global public website runtime")
public class PublicWebsiteController {

    private final PublicWebsiteService publicWebsiteService;
    private final SeoService seoService;
    private final DemoOrchestrationService demoService;
    private final InvestorRoomService investorRoomService;

    public PublicWebsiteController(PublicWebsiteService publicWebsiteService,
                                   SeoService seoService,
                                   DemoOrchestrationService demoService,
                                   InvestorRoomService investorRoomService) {
        this.publicWebsiteService = publicWebsiteService;
        this.seoService = seoService;
        this.demoService = demoService;
        this.investorRoomService = investorRoomService;
    }

    @Operation(summary = "Public website root")
    @GetMapping({"", "/"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> root() {
        Map<String, Object> payload = Map.of(
                "message", "CloudCampus public website API",
                "routes", List.of(
                        "/v1/public/website/pages",
                        "/v1/public/website/navigation",
                        "/v1/public/website/theme",
                        "/v1/public/website/seo?routePath=/",
                        "/v1/public/website/showcase/demo",
                        "/v1/public/website/showcase/investors"
                )
        );
        return ResponseEntity.ok(ApiResponse.ok(null, payload));
    }

    @Operation(summary = "List published pages")
    @GetMapping("/pages")
    public ResponseEntity<ApiResponse<?>> pages() {
        return ResponseEntity.ok(ApiResponse.ok(null, publicWebsiteService.publishedPages()));
    }

    @Operation(summary = "Resolve published page by slug")
    @GetMapping("/pages/{slug}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> page(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(null, publicWebsiteService.publicPageBySlug(slug)));
    }

    @Operation(summary = "Navigation menu")
    @GetMapping("/navigation")
    public ResponseEntity<ApiResponse<List<WebsiteNavigationResponse>>> navigation() {
        return ResponseEntity.ok(ApiResponse.ok(null, publicWebsiteService.publishedNavigation()));
    }

    @Operation(summary = "Active published theme")
    @GetMapping("/theme")
    public ResponseEntity<ApiResponse<WebsiteThemeResponse>> theme() {
        return ResponseEntity.ok(ApiResponse.ok(null, publicWebsiteService.publishedTheme()));
    }

    @Operation(summary = "SEO settings by route")
    @GetMapping("/seo")
    public ResponseEntity<ApiResponse<?>> seo(@RequestParam String routePath) {
        return ResponseEntity.ok(ApiResponse.ok(null, seoService.getByRoute(routePath, true)));
    }

    @Operation(summary = "Demo showcase scenarios")
    @GetMapping("/showcase/demo")
    public ResponseEntity<ApiResponse<List<DemoScenarioResponse>>> demos() {
        return ResponseEntity.ok(ApiResponse.ok(null, demoService.listActiveScenarios()));
    }

    @Operation(summary = "Investor showcase rooms")
    @GetMapping("/showcase/investors")
    public ResponseEntity<ApiResponse<List<InvestorRoomResponse>>> investors() {
        return ResponseEntity.ok(ApiResponse.ok(null, investorRoomService.listPublicActive()));
    }
}
