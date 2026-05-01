package com.cloudcampus.parent.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.parent.dto.LinkParentRequest;
import com.cloudcampus.parent.dto.LinkedStudentResponse;
import com.cloudcampus.parent.service.ParentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/parents")
@RequiredArgsConstructor
@Tag(name = "Parent", description = "Parent portal")
public class ParentController {

    private final ParentService parentService;

    @GetMapping("/me/children")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Linked students for current parent", parameters = {
            @Parameter(name = "X-Tenant-Slug", required = true),
            @Parameter(name = "Authorization", required = true)
    })
    public ResponseEntity<ApiResponse<List<LinkedStudentResponse>>> myChildren() {
        return ResponseEntity.ok(ApiResponse.success("Children", parentService.myChildren()));
    }

    @PostMapping("/links")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    @Operation(summary = "Link a parent user to a student", parameters = {
            @Parameter(name = "X-Tenant-Slug", required = true),
            @Parameter(name = "Authorization", required = true)
    })
    public ResponseEntity<ApiResponse<Void>> linkStudent(
            @Valid @RequestBody LinkParentRequest request) {
        parentService.linkStudent(request);
        return ResponseEntity.ok(ApiResponse.success("Parent linked to student", null));
    }

    @DeleteMapping("/links/{linkId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    @Operation(summary = "Remove a parent–student link", parameters = {
            @Parameter(name = "X-Tenant-Slug", required = true),
            @Parameter(name = "Authorization", required = true)
    })
    public ResponseEntity<Void> unlinkStudent(@PathVariable UUID linkId) {
        parentService.unlinkStudent(linkId);
        return ResponseEntity.noContent().build();
    }
}
