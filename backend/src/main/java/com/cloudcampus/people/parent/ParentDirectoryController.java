package com.cloudcampus.people.parent;

import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ParentDirectoryController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final ParentDirectoryService parentDirectoryService;

    public ParentDirectoryController(
            AuthenticatedUserResolver authenticatedUserResolver,
            ParentDirectoryService parentDirectoryService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.parentDirectoryService = parentDirectoryService;
    }

    @GetMapping("/v1/school-admin/parents")
    ResponseEntity<PageResponse<ParentDirectoryResponse>> parents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(parentDirectoryService.parents(authenticatedUserResolver.requireUser(request), page, size));
    }
}
