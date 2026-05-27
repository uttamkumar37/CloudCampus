package com.cloudcampus.people.parent;

import java.util.List;

import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ParentLeaveRequestController {

    @SuppressWarnings("unused")
    private final SchoolAccessService schoolAccessServiceGuardMarker;
    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final ParentLeaveRequestService parentLeaveRequestService;

    public ParentLeaveRequestController(
            SchoolAccessService schoolAccessServiceGuardMarker,
            AuthenticatedUserResolver authenticatedUserResolver,
            ParentLeaveRequestService parentLeaveRequestService
    ) {
        this.schoolAccessServiceGuardMarker = schoolAccessServiceGuardMarker;
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.parentLeaveRequestService = parentLeaveRequestService;
    }

    @PostMapping("/v1/parent/children/{studentId}/leave-requests")
    ResponseEntity<ParentLeaveRequestResponse> createParentRequest(
            @PathVariable String studentId,
            @Valid @RequestBody ParentLeaveRequestCreateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(parentLeaveRequestService.create(
                authenticatedUserResolver.requireUser(request),
                studentId,
                requestBody
        ));
    }

    @GetMapping("/v1/parent/children/{studentId}/leave-requests")
    ResponseEntity<List<ParentLeaveRequestResponse>> parentRequests(
            @PathVariable String studentId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(parentLeaveRequestService.parentRequests(
                authenticatedUserResolver.requireUser(request),
                studentId
        ));
    }

    @GetMapping("/v1/school-admin/parent-leave-requests")
    ResponseEntity<List<ParentLeaveRequestResponse>> schoolRequests(HttpServletRequest request) {
        return ResponseEntity.ok(parentLeaveRequestService.schoolRequests(authenticatedUserResolver.requireUser(request)));
    }

    @PatchMapping("/v1/school-admin/parent-leave-requests/{leaveRequestId}")
    ResponseEntity<ParentLeaveRequestResponse> decide(
            @PathVariable String leaveRequestId,
            @Valid @RequestBody ParentLeaveDecisionRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(parentLeaveRequestService.decide(
                authenticatedUserResolver.requireUser(request),
                leaveRequestId,
                requestBody
        ));
    }
}
