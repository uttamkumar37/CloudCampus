package com.cloudcampus.academic;

import java.util.List;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/teacher/assignments")
public class TeacherAssignmentPortalController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AcademicAssignmentService academicAssignmentService;

    public TeacherAssignmentPortalController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AcademicAssignmentService academicAssignmentService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.academicAssignmentService = academicAssignmentService;
    }

    @GetMapping
    ResponseEntity<List<TeacherAssignmentResponse>> list(
            @RequestParam(required = false) String classLevelId,
            HttpServletRequest request
    ) {
        if (classLevelId == null || classLevelId.isBlank()) {
            return ResponseEntity.ok(academicAssignmentService.myAssignments(
                    authenticatedUserResolver.requireUser(request)
            ));
        }
        return ResponseEntity.ok(academicAssignmentService.myAssignmentsForClass(
                authenticatedUserResolver.requireUser(request),
                classLevelId
        ));
    }
}
