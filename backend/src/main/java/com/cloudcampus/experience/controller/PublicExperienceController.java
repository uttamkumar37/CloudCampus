package com.cloudcampus.experience.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.experience.dto.request.DemoStartRequest;
import com.cloudcampus.experience.dto.request.IngestEventsRequest;
import com.cloudcampus.experience.dto.response.ContentBlockResponse;
import com.cloudcampus.experience.dto.response.DemoScenarioResponse;
import com.cloudcampus.experience.dto.response.DemoSessionResponse;
import com.cloudcampus.experience.service.ContentBlockService;
import com.cloudcampus.experience.service.DemoOrchestrationService;
import com.cloudcampus.experience.service.ExperienceEventPublisher;
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

    public PublicExperienceController(ContentBlockService contentBlockService,
                                      DemoOrchestrationService demoService,
                                      ExperienceEventPublisher eventPublisher) {
        this.contentBlockService = contentBlockService;
        this.demoService         = demoService;
        this.eventPublisher      = eventPublisher;
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
