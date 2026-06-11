package com.cloudcampus.operations.exam;

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
public class ExamController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final RequestContextResolver requestContextResolver;
    private final ExamService examService;

    public ExamController(
            AuthenticatedUserResolver authenticatedUserResolver,
            RequestContextResolver requestContextResolver,
            ExamService examService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.requestContextResolver = requestContextResolver;
        this.examService = examService;
    }

    @PostMapping("/v1/school-admin/exams")
    ResponseEntity<ExamResponse> createSchoolAdminExam(
            @Valid @RequestBody ExamRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.createSchoolAdminExam(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/v1/school-admin/exams")
    ResponseEntity<List<ExamResponse>> schoolExams(HttpServletRequest request) {
        return ResponseEntity.ok(examService.schoolExams(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/school-admin/exams/{examId}")
    ResponseEntity<ExamResponse> schoolExam(@PathVariable String examId, HttpServletRequest request) {
        return ResponseEntity.ok(examService.schoolExam(
                authenticatedUserResolver.requireUser(request),
                examId
        ));
    }

    @PostMapping("/v1/school-admin/exams/{examId}/results")
    ResponseEntity<ExamResponse> recordSchoolAdminMarks(
            @PathVariable String examId,
            @Valid @RequestBody ExamMarksRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(examService.recordSchoolAdminMarks(
                authenticatedUserResolver.requireUser(request),
                examId,
                requestBody
        ));
    }

    @PostMapping("/v1/school-admin/exams/{examId}/publish")
    ResponseEntity<ExamResponse> publishSchoolAdminExam(@PathVariable String examId, HttpServletRequest request) {
        return ResponseEntity.ok(examService.publishSchoolAdminExam(
                authenticatedUserResolver.requireUser(request),
                examId
        ));
    }

    @GetMapping("/v1/teacher/exams")
    ResponseEntity<List<ExamResponse>> teacherExams(
            @RequestParam @NotBlank String classLevelId,
            @RequestParam @NotBlank String subjectId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(examService.teacherExams(
                requestContextResolver.requireContext(request),
                classLevelId,
                subjectId
        ));
    }

    @GetMapping("/v1/teacher/exams/{examId}")
    ResponseEntity<ExamResponse> teacherExam(@PathVariable String examId, HttpServletRequest request) {
        return ResponseEntity.ok(examService.teacherExam(
                requestContextResolver.requireContext(request),
                examId
        ));
    }

    @GetMapping("/v1/teacher/exams/{examId}/roster")
    ResponseEntity<List<ExamRosterStudentResponse>> teacherExamRoster(
            @PathVariable String examId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(examService.teacherExamRoster(
                requestContextResolver.requireContext(request),
                examId
        ));
    }

    @PostMapping("/v1/teacher/exams/{examId}/results")
    ResponseEntity<ExamResponse> recordTeacherMarks(
            @PathVariable String examId,
            @Valid @RequestBody ExamMarksRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(examService.recordTeacherMarks(
                requestContextResolver.requireContext(request),
                examId,
                requestBody
        ));
    }

    @GetMapping("/v1/parent/children/{studentId}/results")
    ResponseEntity<List<ExamResponse>> parentChildResults(
            @PathVariable String studentId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(examService.parentChildResults(
                requestContextResolver.requireContext(request),
                studentId
        ));
    }

    @GetMapping("/v1/student/results")
    ResponseEntity<List<ExamResponse>> studentResults(HttpServletRequest request) {
        return ResponseEntity.ok(examService.studentResults(requestContextResolver.requireContext(request)));
    }
}
