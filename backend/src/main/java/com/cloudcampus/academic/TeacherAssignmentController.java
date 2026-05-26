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
@RequestMapping("/v1/school-admin/teacher-assignments")
public class TeacherAssignmentController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AcademicAssignmentService academicAssignmentService;

    public TeacherAssignmentController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AcademicAssignmentService academicAssignmentService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.academicAssignmentService = academicAssignmentService;
    }

    @PostMapping
    ResponseEntity<TeacherAssignmentResponse> create(
            @Valid @RequestBody TeacherAssignmentRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicAssignmentService.assignTeacher(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping
    ResponseEntity<List<TeacherAssignmentResponse>> list(
            @RequestParam @NotBlank String classLevelId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(academicAssignmentService.teacherAssignmentsForClass(
                authenticatedUserResolver.requireUser(request),
                classLevelId
        ));
    }
}
