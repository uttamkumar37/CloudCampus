package com.cloudcampus.operations.notice;

import java.util.List;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
public class NoticeController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final NoticeService noticeService;

    public NoticeController(
            AuthenticatedUserResolver authenticatedUserResolver,
            NoticeService noticeService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.noticeService = noticeService;
    }

    @PostMapping("/v1/school-admin/notices")
    ResponseEntity<NoticeResponse> createSchoolNotice(
            @Valid @RequestBody NoticeRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(noticeService.createSchoolNotice(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/v1/school-admin/notices")
    ResponseEntity<List<NoticeResponse>> schoolNotices(HttpServletRequest request) {
        return ResponseEntity.ok(noticeService.schoolNotices(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/school-admin/notices/{noticeId}")
    ResponseEntity<NoticeResponse> schoolNotice(
            @PathVariable String noticeId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(noticeService.schoolNotice(
                authenticatedUserResolver.requireUser(request),
                noticeId
        ));
    }

    @PostMapping("/v1/school-admin/notices/{noticeId}/publish")
    ResponseEntity<NoticeResponse> publishSchoolNotice(
            @PathVariable String noticeId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(noticeService.publishSchoolNotice(
                authenticatedUserResolver.requireUser(request),
                noticeId
        ));
    }

    @GetMapping("/v1/teacher/notices")
    ResponseEntity<List<NoticeResponse>> teacherNotices(HttpServletRequest request) {
        return ResponseEntity.ok(noticeService.teacherNotices(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/parent/children/{studentId}/notices")
    ResponseEntity<List<NoticeResponse>> parentChildNotices(
            @PathVariable String studentId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(noticeService.parentChildNotices(
                authenticatedUserResolver.requireUser(request),
                studentId
        ));
    }

    @GetMapping("/v1/student/notices")
    ResponseEntity<List<NoticeResponse>> studentNotices(HttpServletRequest request) {
        return ResponseEntity.ok(noticeService.studentNotices(authenticatedUserResolver.requireUser(request)));
    }
}
