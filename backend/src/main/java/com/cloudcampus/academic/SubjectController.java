package com.cloudcampus.academic;

import java.util.List;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/school-admin/subjects")
public class SubjectController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AcademicAssignmentService academicAssignmentService;

    public SubjectController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AcademicAssignmentService academicAssignmentService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.academicAssignmentService = academicAssignmentService;
    }

    @PostMapping
    ResponseEntity<SubjectResponse> create(
            @Valid @RequestBody SubjectRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicAssignmentService.createSubject(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping
    ResponseEntity<List<SubjectResponse>> list(HttpServletRequest request) {
        return ResponseEntity.ok(academicAssignmentService.subjects(
                authenticatedUserResolver.requireUser(request)
        ));
    }
}
