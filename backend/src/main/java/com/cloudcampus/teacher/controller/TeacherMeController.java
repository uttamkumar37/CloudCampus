package com.cloudcampus.teacher.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.staff.dto.TeacherMeResponse;
import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.repository.StaffRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/teacher")
@PreAuthorize("hasRole('TEACHER')")
@Tag(name = "Teacher — Me", description = "Authenticated teacher identity snapshot")
public class TeacherMeController {

    private final StaffRepository staffRepo;
    private final SchoolRepository schoolRepo;

    public TeacherMeController(StaffRepository staffRepo, SchoolRepository schoolRepo) {
        this.staffRepo = staffRepo;
        this.schoolRepo = schoolRepo;
    }

    @Operation(summary = "My teacher profile",
               description = "Returns the authenticated teacher's own portal identity snapshot.")
    @GetMapping("/me")
    public ApiResponse<TeacherMeResponse> me() {
        Staff staff = staffRepo.findByUserId(RequestContext.getUserId())
                .orElseThrow(() -> new NotFoundException("Staff profile not found for current user"));
        School school = schoolRepo.findByIdFiltered(staff.getSchoolId())
                .orElseThrow(() -> new NotFoundException("School not found"));

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), TeacherMeResponse.from(staff, school));
    }
}
