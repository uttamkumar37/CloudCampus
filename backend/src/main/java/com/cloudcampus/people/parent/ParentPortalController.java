package com.cloudcampus.people.parent;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import com.cloudcampus.common.context.RequestContextResolver;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/parent/children")
public class ParentPortalController {

    private final RequestContextResolver requestContextResolver;
    private final ParentLinkService parentLinkService;

    public ParentPortalController(
            RequestContextResolver requestContextResolver,
            ParentLinkService parentLinkService
    ) {
        this.requestContextResolver = requestContextResolver;
        this.parentLinkService = parentLinkService;
    }

    @GetMapping
    ResponseEntity<List<ParentChildResponse>> children(HttpServletRequest request) {
        return ResponseEntity.ok(parentLinkService.children(requestContextResolver.requireContext(request)));
    }

    @GetMapping("/{studentId}")
    ResponseEntity<ParentChildResponse> child(
            @PathVariable String studentId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(parentLinkService.child(
                requestContextResolver.requireContext(request),
                studentId
        ));
    }
}
