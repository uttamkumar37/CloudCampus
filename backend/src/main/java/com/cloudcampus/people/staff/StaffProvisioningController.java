package com.cloudcampus.people.staff;

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
@RequestMapping("/v1/school-admin/staff/provision")
public class StaffProvisioningController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final StaffProvisioningService staffProvisioningService;

    public StaffProvisioningController(
            AuthenticatedUserResolver authenticatedUserResolver,
            StaffProvisioningService staffProvisioningService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.staffProvisioningService = staffProvisioningService;
    }

    @PostMapping
    ResponseEntity<StaffProvisioningResponse> provision(
            @Valid @RequestBody StaffProvisioningRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(staffProvisioningService.provision(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }
}
