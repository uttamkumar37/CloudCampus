package com.cloudcampus.people.parent;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/parent/children")
public class ParentPortalController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final ParentLinkService parentLinkService;

    public ParentPortalController(
            AuthenticatedUserResolver authenticatedUserResolver,
            ParentLinkService parentLinkService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.parentLinkService = parentLinkService;
    }

    @GetMapping
    ResponseEntity<List<ParentChildResponse>> children(HttpServletRequest request) {
        return ResponseEntity.ok(parentLinkService.children(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/{studentId}")
    ResponseEntity<ParentChildResponse> child(
            @PathVariable String studentId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(parentLinkService.child(
                authenticatedUserResolver.requireUser(request),
                studentId
        ));
    }
}
