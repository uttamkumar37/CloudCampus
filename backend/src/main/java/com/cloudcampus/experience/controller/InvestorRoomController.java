package com.cloudcampus.experience.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.experience.dto.response.InvestorRoomResponse;
import com.cloudcampus.experience.service.InvestorRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Public investor room endpoints — room metadata is public; content requires access token.
 * Super admin creation is in SuperAdminExperienceController.
 */
@RestController
@RequestMapping("/v1/experience/public/investor")
@Tag(name = "Public — Investor Room", description = "Investor data room access")
public class InvestorRoomController {

    private final InvestorRoomService investorRoomService;

    public InvestorRoomController(InvestorRoomService investorRoomService) {
        this.investorRoomService = investorRoomService;
    }

    @Operation(summary = "Get investor room metadata (title, access mode — no financials)")
    @SecurityRequirements
    @GetMapping("/{roomCode}")
    public ResponseEntity<ApiResponse<InvestorRoomResponse>> getRoom(
            @PathVariable String roomCode) {
        return ResponseEntity.ok(ApiResponse.ok(null, investorRoomService.getPublicRoom(roomCode)));
    }

    @Operation(summary = "Verify password access for a PASSWORD-mode room")
    @SecurityRequirements
    @PostMapping("/{roomCode}/access")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyAccess(
            @PathVariable String roomCode,
            @RequestBody Map<String, String> body) {
        Optional<InvestorRoomResponse> room =
                investorRoomService.unlockRoom(roomCode, body.getOrDefault("password", ""));
        if (room.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok(null, Map.of("granted", false)));
        }
        return ResponseEntity.ok(ApiResponse.ok(null, Map.of(
                "granted", true,
                "room", room.get())));
    }
}
