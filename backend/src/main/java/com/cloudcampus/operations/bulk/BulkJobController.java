package com.cloudcampus.operations.bulk;

import java.util.List;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/school-admin/bulk-jobs")
public class BulkJobController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final BulkJobService bulkJobService;

    public BulkJobController(AuthenticatedUserResolver authenticatedUserResolver, BulkJobService bulkJobService) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.bulkJobService = bulkJobService;
    }

    @PostMapping
    ResponseEntity<BulkJobResponse> create(
            @Valid @RequestBody BulkJobCreateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bulkJobService.create(authenticatedUserResolver.requireUser(request), requestBody));
    }

    @GetMapping
    ResponseEntity<List<BulkJobResponse>> list(HttpServletRequest request) {
        return ResponseEntity.ok(bulkJobService.list(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/{bulkJobId}")
    ResponseEntity<BulkJobResponse> get(@PathVariable String bulkJobId, HttpServletRequest request) {
        return ResponseEntity.ok(bulkJobService.get(authenticatedUserResolver.requireUser(request), bulkJobId));
    }

    @PostMapping("/{bulkJobId}/cancel")
    ResponseEntity<BulkJobResponse> cancel(@PathVariable String bulkJobId, HttpServletRequest request) {
        return ResponseEntity.ok(bulkJobService.cancel(authenticatedUserResolver.requireUser(request), bulkJobId));
    }
}
