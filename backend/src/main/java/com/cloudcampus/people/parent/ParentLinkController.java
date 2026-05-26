package com.cloudcampus.people.parent;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/school-admin/parent-links")
public class ParentLinkController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final ParentLinkService parentLinkService;

    public ParentLinkController(
            AuthenticatedUserResolver authenticatedUserResolver,
            ParentLinkService parentLinkService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.parentLinkService = parentLinkService;
    }

    @PostMapping
    ResponseEntity<ParentLinkResponse> linkParent(
            @Valid @RequestBody ParentLinkRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(parentLinkService.linkParent(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }
}
