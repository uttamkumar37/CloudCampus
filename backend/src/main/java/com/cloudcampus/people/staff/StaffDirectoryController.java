package com.cloudcampus.people.staff;

import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StaffDirectoryController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final StaffDirectoryService staffDirectoryService;

    public StaffDirectoryController(
            AuthenticatedUserResolver authenticatedUserResolver,
            StaffDirectoryService staffDirectoryService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.staffDirectoryService = staffDirectoryService;
    }

    @GetMapping("/v1/school-admin/staff")
    ResponseEntity<PageResponse<StaffDirectoryResponse>> staff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(staffDirectoryService.staff(authenticatedUserResolver.requireUser(request), page, size));
    }

    @GetMapping("/v1/school-admin/teachers")
    ResponseEntity<PageResponse<StaffDirectoryResponse>> teachers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(staffDirectoryService.teachers(authenticatedUserResolver.requireUser(request), page, size));
    }
}
