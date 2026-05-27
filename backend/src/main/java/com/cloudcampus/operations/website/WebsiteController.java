package com.cloudcampus.operations.website;

import java.util.List;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
public class WebsiteController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final WebsiteService websiteService;

    public WebsiteController(
            AuthenticatedUserResolver authenticatedUserResolver,
            WebsiteService websiteService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.websiteService = websiteService;
    }

    @PostMapping("/v1/school-admin/website/pages")
    ResponseEntity<WebsitePageResponse> create(
            @Valid @RequestBody WebsitePageRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(websiteService.create(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/v1/school-admin/website/pages")
    ResponseEntity<List<WebsitePageResponse>> list(HttpServletRequest request) {
        return ResponseEntity.ok(websiteService.list(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/school-admin/website/pages/{pageId}")
    ResponseEntity<WebsitePageResponse> read(
            @PathVariable String pageId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(websiteService.read(
                authenticatedUserResolver.requireUser(request),
                pageId
        ));
    }

    @PostMapping("/v1/school-admin/website/pages/{pageId}/publish")
    ResponseEntity<WebsitePageResponse> publish(
            @PathVariable String pageId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(websiteService.publish(
                authenticatedUserResolver.requireUser(request),
                pageId
        ));
    }
}
