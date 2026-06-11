package com.cloudcampus.academic;

import java.util.List;

import com.cloudcampus.common.context.RequestContextResolver;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/teacher/assignments")
public class TeacherAssignmentPortalController {

    private final RequestContextResolver requestContextResolver;
    private final AcademicAssignmentService academicAssignmentService;

    public TeacherAssignmentPortalController(
            RequestContextResolver requestContextResolver,
            AcademicAssignmentService academicAssignmentService
    ) {
        this.requestContextResolver = requestContextResolver;
        this.academicAssignmentService = academicAssignmentService;
    }

    @GetMapping
    ResponseEntity<List<TeacherAssignmentResponse>> list(
            @RequestParam(required = false) String classLevelId,
            HttpServletRequest request
    ) {
        if (classLevelId == null || classLevelId.isBlank()) {
            return ResponseEntity.ok(academicAssignmentService.myAssignments(
                    requestContextResolver.requireContext(request)
            ));
        }
        return ResponseEntity.ok(academicAssignmentService.myAssignmentsForClass(
                requestContextResolver.requireContext(request),
                classLevelId
        ));
    }
}
