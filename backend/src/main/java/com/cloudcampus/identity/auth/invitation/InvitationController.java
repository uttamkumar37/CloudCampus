package com.cloudcampus.identity.auth.invitation;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/invitations")
public class InvitationController {

    private final InvitationAcceptanceService invitationAcceptanceService;

    public InvitationController(InvitationAcceptanceService invitationAcceptanceService) {
        this.invitationAcceptanceService = invitationAcceptanceService;
    }

    @PostMapping("/accept")
    ResponseEntity<AcceptInvitationResponse> accept(@Valid @RequestBody AcceptInvitationRequest request) {
        return ResponseEntity.ok(invitationAcceptanceService.accept(request));
    }
}
