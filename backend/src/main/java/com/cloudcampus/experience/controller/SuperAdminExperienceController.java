package com.cloudcampus.experience.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.experience.dto.request.ContentBlockCreateRequest;
import com.cloudcampus.experience.dto.request.ContentBlockUpdateRequest;
import com.cloudcampus.experience.dto.request.InvestorRoomCreateRequest;
import com.cloudcampus.experience.dto.response.ContentBlockResponse;
import com.cloudcampus.experience.dto.response.DemoScenarioResponse;
import com.cloudcampus.experience.dto.response.InvestorRoomResponse;
import com.cloudcampus.experience.dto.response.PresentationResponse;
import com.cloudcampus.experience.service.ContentBlockService;
import com.cloudcampus.experience.service.DemoOrchestrationService;
import com.cloudcampus.experience.service.InvestorRoomService;
import com.cloudcampus.experience.service.PresentationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
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

    private final ContentBlockService      contentBlockService;
    private final DemoOrchestrationService demoService;
    private final InvestorRoomService      investorRoomService;
    private final PresentationService      presentationService;

    public SuperAdminExperienceController(ContentBlockService contentBlockService,
                                          DemoOrchestrationService demoService,
                                          InvestorRoomService investorRoomService,
                                          PresentationService presentationService) {
        this.contentBlockService = contentBlockService;
        this.demoService         = demoService;
        this.investorRoomService = investorRoomService;
        this.presentationService = presentationService;
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

    @Operation(summary = "Publish a presentation (makes it publicly viewable)")
    @PostMapping("/presentations/{id}/publish")
    public ResponseEntity<ApiResponse<PresentationResponse>> publishPresentation(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(null, presentationService.publish(id)));
    }
}
