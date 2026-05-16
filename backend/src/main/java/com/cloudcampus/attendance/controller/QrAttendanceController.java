package com.cloudcampus.attendance.controller;

import com.cloudcampus.attendance.dto.QrMarkRequest;
import com.cloudcampus.attendance.service.QrAttendanceService;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Student self-mark via QR token (CC-0802).
 *
 * POST /v1/student/attendance/qr-mark  — validates token, marks student PRESENT
 *
 * The teacher-side QR generation lives in TeacherAttendanceController to stay
 * co-located with the rest of the teacher attendance flow.
 */
@RestController
@Tag(name = "QR Attendance — Student", description = "Student self-mark via scanned QR token (CC-0802)")
public class QrAttendanceController {

    private final QrAttendanceService qrService;

    public QrAttendanceController(QrAttendanceService qrService) {
        this.qrService = qrService;
    }

    @Operation(summary = "Self-mark attendance via QR token (Student)")
    @PostMapping("/v1/student/attendance/qr-mark")
    public ResponseEntity<ApiResponse<Map<String, String>>> selfMark(
            @Valid @RequestBody QrMarkRequest request) {

        UUID userId = RequestContext.getUserId();
        qrService.selfMark(request.token(), userId);
        return ResponseEntity.ok(ApiResponse.ok(
                MDC.get(CorrelationId.MDC_KEY),
                Map.of("status", "MARKED", "markedAt", Instant.now().toString())
        ));
    }
}
