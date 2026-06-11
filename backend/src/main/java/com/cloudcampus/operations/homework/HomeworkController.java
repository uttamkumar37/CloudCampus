package com.cloudcampus.operations.homework;

import java.util.List;

import com.cloudcampus.common.context.RequestContextResolver;
import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
public class HomeworkController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final RequestContextResolver requestContextResolver;
    private final HomeworkService homeworkService;

    public HomeworkController(
            AuthenticatedUserResolver authenticatedUserResolver,
            RequestContextResolver requestContextResolver,
            HomeworkService homeworkService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.requestContextResolver = requestContextResolver;
        this.homeworkService = homeworkService;
    }

    @PostMapping("/v1/school-admin/homework")
    ResponseEntity<HomeworkResponse> createSchoolAdminHomework(
            @Valid @RequestBody HomeworkRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(homeworkService.createSchoolAdminHomework(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/v1/school-admin/homework")
    ResponseEntity<List<HomeworkResponse>> schoolHomework(HttpServletRequest request) {
        return ResponseEntity.ok(homeworkService.schoolHomework(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/school-admin/homework/{homeworkId}")
    ResponseEntity<HomeworkResponse> schoolHomework(
            @PathVariable String homeworkId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(homeworkService.schoolHomework(
                authenticatedUserResolver.requireUser(request),
                homeworkId
        ));
    }

    @PostMapping("/v1/teacher/homework")
    ResponseEntity<HomeworkResponse> createTeacherHomework(
            @Valid @RequestBody HomeworkRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(homeworkService.createTeacherHomework(
                requestContextResolver.requireContext(request),
                requestBody
        ));
    }

    @GetMapping("/v1/teacher/homework")
    ResponseEntity<List<HomeworkResponse>> teacherHomework(
            @RequestParam @NotBlank String classLevelId,
            @RequestParam @NotBlank String subjectId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(homeworkService.teacherHomework(
                requestContextResolver.requireContext(request),
                classLevelId,
                subjectId
        ));
    }

    @GetMapping("/v1/teacher/homework/{homeworkId}")
    ResponseEntity<HomeworkResponse> teacherHomework(
            @PathVariable String homeworkId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(homeworkService.teacherHomework(
                requestContextResolver.requireContext(request),
                homeworkId
        ));
    }

    @GetMapping("/v1/parent/children/{studentId}/homework")
    ResponseEntity<List<HomeworkResponse>> parentChildHomework(
            @PathVariable String studentId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(homeworkService.parentChildHomework(
                requestContextResolver.requireContext(request),
                studentId
        ));
    }

    @GetMapping("/v1/student/homework")
    ResponseEntity<List<HomeworkResponse>> studentHomework(HttpServletRequest request) {
        return ResponseEntity.ok(homeworkService.studentHomework(requestContextResolver.requireContext(request)));
    }

    @PostMapping("/v1/student/homework/{homeworkId}/submissions")
    ResponseEntity<HomeworkResponse> submitStudentHomework(
            @PathVariable String homeworkId,
            @Valid @RequestBody HomeworkSubmissionRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(homeworkService.submitStudentHomework(
                requestContextResolver.requireContext(request),
                homeworkId,
                requestBody
        ));
    }
}
