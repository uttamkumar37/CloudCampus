package com.cloudcampus.academic;

import java.util.List;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

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
@RequestMapping("/v1/school-admin/class-subjects")
public class ClassSubjectAssignmentController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AcademicAssignmentService academicAssignmentService;

    public ClassSubjectAssignmentController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AcademicAssignmentService academicAssignmentService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.academicAssignmentService = academicAssignmentService;
    }

    @PostMapping
    ResponseEntity<ClassSubjectAssignmentResponse> create(
            @Valid @RequestBody ClassSubjectAssignmentRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicAssignmentService.assignSubjectToClass(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping
    ResponseEntity<List<ClassSubjectAssignmentResponse>> list(
            @RequestParam @NotBlank String classLevelId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(academicAssignmentService.classSubjectAssignments(
                authenticatedUserResolver.requireUser(request),
                classLevelId
        ));
    }
}
