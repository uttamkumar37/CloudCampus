package com.cloudcampus.staff.profile.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.staff.profile.dto.StaffProfile360Response;
import com.cloudcampus.staff.profile.service.StaffProfile360Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/v1/school-admin/staff/{staffId}/profile-360")
@Tag(name = "School Admin — Staff 360 Profile", description = "Enterprise staff workforce profile, analytics, timeline, and risk insights")
public class StaffProfile360Controller {

    private final StaffProfile360Service service;

    public StaffProfile360Controller(StaffProfile360Service service) {
        this.service = service;
    }

    @Operation(summary = "Get staff 360 profile aggregate")
    @GetMapping
    public ResponseEntity<ApiResponse<StaffProfile360Response>> get(@PathVariable UUID staffId) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.getProfile(staffId)));
    }
}
