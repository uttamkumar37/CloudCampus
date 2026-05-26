package com.cloudcampus.academic;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/v1/school-admin/sections")
public class SectionController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AcademicLifecycleService academicLifecycleService;

    public SectionController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AcademicLifecycleService academicLifecycleService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.academicLifecycleService = academicLifecycleService;
    }

    @PostMapping
    ResponseEntity<SectionResponse> create(
            @Valid @RequestBody SectionRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicLifecycleService.createSection(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping
    ResponseEntity<List<SectionResponse>> list(
            @RequestParam @NotBlank String classLevelId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(academicLifecycleService.sections(
                authenticatedUserResolver.requireUser(request),
                classLevelId
        ));
    }
}
