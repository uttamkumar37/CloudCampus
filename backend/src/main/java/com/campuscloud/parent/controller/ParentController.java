package com.campuscloud.parent.controller;

import com.campuscloud.common.api.ApiResponse;
import com.campuscloud.parent.dto.LinkedStudentResponse;
import com.campuscloud.parent.service.ParentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parents")
@RequiredArgsConstructor
@Tag(name = "Parent", description = "Parent portal")
public class ParentController {

    private final ParentService parentService;

    @GetMapping("/me/children")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Linked students for current parent", parameters = {
            @Parameter(name = "X-Tenant-ID", required = true),
            @Parameter(name = "Authorization", required = true)
    })
    public ResponseEntity<ApiResponse<List<LinkedStudentResponse>>> myChildren() {
        return ResponseEntity.ok(ApiResponse.success("Children", parentService.myChildren()));
    }
}
