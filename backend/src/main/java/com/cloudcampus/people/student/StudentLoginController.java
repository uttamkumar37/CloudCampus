package com.cloudcampus.people.student;

import com.cloudcampus.common.context.RequestContextResolver;
import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StudentLoginController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final RequestContextResolver requestContextResolver;
    private final StudentLoginService studentLoginService;

    public StudentLoginController(
            AuthenticatedUserResolver authenticatedUserResolver,
            RequestContextResolver requestContextResolver,
            StudentLoginService studentLoginService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.requestContextResolver = requestContextResolver;
        this.studentLoginService = studentLoginService;
    }

    @PostMapping("/v1/school-admin/students/{studentId}/login-invitation")
    ResponseEntity<StudentLoginInvitationResponse> inviteStudentLogin(
            @PathVariable String studentId,
            @Valid @RequestBody StudentLoginInvitationRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentLoginService.inviteStudentLogin(
                authenticatedUserResolver.requireUser(request),
                studentId,
                requestBody
        ));
    }

    @GetMapping("/v1/student/profile")
    ResponseEntity<StudentSelfProfileResponse> selfProfile(HttpServletRequest request) {
        return ResponseEntity.ok(studentLoginService.selfProfile(requestContextResolver.requireContext(request)));
    }
}
