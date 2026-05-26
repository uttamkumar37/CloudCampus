package com.cloudcampus.academic;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/school-admin/academic-years")
public class AcademicYearController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AcademicLifecycleService academicLifecycleService;

    public AcademicYearController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AcademicLifecycleService academicLifecycleService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.academicLifecycleService = academicLifecycleService;
    }

    @PostMapping
    ResponseEntity<AcademicYearResponse> create(
            @Valid @RequestBody AcademicYearRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicLifecycleService.createAcademicYear(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping
    ResponseEntity<List<AcademicYearResponse>> list(HttpServletRequest request) {
        return ResponseEntity.ok(academicLifecycleService.academicYears(
                authenticatedUserResolver.requireUser(request)
        ));
    }

    @PostMapping("/{academicYearId}/activate")
    ResponseEntity<AcademicYearResponse> activate(
            @PathVariable String academicYearId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(academicLifecycleService.activateAcademicYear(
                authenticatedUserResolver.requireUser(request),
                academicYearId
        ));
    }
}
