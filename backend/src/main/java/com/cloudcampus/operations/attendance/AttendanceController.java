package com.cloudcampus.operations.attendance;

import java.util.List;

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
public class AttendanceController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AttendanceService attendanceService;

    public AttendanceController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AttendanceService attendanceService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.attendanceService = attendanceService;
    }

    @PostMapping("/v1/school-admin/attendance/sessions")
    ResponseEntity<AttendanceSessionResponse> createSchoolAdminSession(
            @Valid @RequestBody AttendanceSessionRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.createSchoolAdminSession(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/v1/school-admin/attendance/sessions")
    ResponseEntity<List<AttendanceSessionResponse>> schoolAdminSessions(HttpServletRequest request) {
        return ResponseEntity.ok(attendanceService.schoolAdminSessions(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/school-admin/attendance/sessions/{sessionId}")
    ResponseEntity<AttendanceSessionResponse> schoolAdminSession(
            @PathVariable String sessionId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(attendanceService.schoolAdminSession(
                authenticatedUserResolver.requireUser(request),
                sessionId
        ));
    }

    @PostMapping("/v1/teacher/attendance/sessions")
    ResponseEntity<AttendanceSessionResponse> createTeacherSession(
            @Valid @RequestBody AttendanceSessionRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.createTeacherSession(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/v1/teacher/attendance/sessions")
    ResponseEntity<List<AttendanceSessionResponse>> teacherSessions(
            @RequestParam @NotBlank String classLevelId,
            @RequestParam @NotBlank String subjectId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(attendanceService.teacherSessions(
                authenticatedUserResolver.requireUser(request),
                classLevelId,
                subjectId
        ));
    }

    @GetMapping("/v1/teacher/attendance/sessions/{sessionId}")
    ResponseEntity<AttendanceSessionResponse> teacherSession(
            @PathVariable String sessionId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(attendanceService.teacherSession(
                authenticatedUserResolver.requireUser(request),
                sessionId
        ));
    }
}
