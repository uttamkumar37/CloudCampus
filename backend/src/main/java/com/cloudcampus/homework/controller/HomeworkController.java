package com.cloudcampus.homework.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.homework.dto.HomeworkCreateRequest;
import com.cloudcampus.homework.dto.HomeworkResponse;
import com.cloudcampus.homework.service.HomeworkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/homework")
@RequiredArgsConstructor
@Tag(name = "Homework", description = "Homework assignments")
public class HomeworkController {

    private final HomeworkService homeworkService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER')")
    @Operation(summary = "Create homework", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT", required = true)
    })
    public ResponseEntity<ApiResponse<HomeworkResponse>> create(@Valid @RequestBody HomeworkCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Homework created", homeworkService.create(request)));
    }

    @GetMapping("/classes/{classId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TEACHER')")
    @Operation(summary = "List homework for a class", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT", required = true)
    })
    public ResponseEntity<ApiResponse<List<HomeworkResponse>>> list(@PathVariable UUID classId) {
        return ResponseEntity.ok(ApiResponse.success("Homework list", homeworkService.listForClass(classId)));
    }
}
