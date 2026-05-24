package com.cloudcampus.mobile.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.notice.dto.NoticeResponse;
import com.cloudcampus.notice.entity.NoticeTarget;
import com.cloudcampus.notice.entity.SchoolNotice;
import com.cloudcampus.notice.repository.SchoolNoticeRepository;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Mobile API — accessible to tenant-scoped roles only (STUDENT, PARENT, TEACHER,
 * STAFF, SCHOOL_ADMIN, TENANT_ADMIN). SUPER_ADMIN is excluded — mobile endpoints
 * require a tenant + school context which super-admin tokens do not carry.
 *
 * GET /v1/mobile/notices           — published notices scoped to caller's role + school
 * GET /v1/mobile/notices/{id}      — single published notice
 *
 * P0-13: School resolution uses the caller's actual JWT-bound school
 * ({@link RequestContext#getSchoolId()}) instead of a hard-coded "MAIN" school
 * code. A student or parent in a non-MAIN school now sees their own school's
 * notices, not MAIN's.
 */
@RestController
@RequestMapping("/v1/mobile")
@Validated
@PreAuthorize("hasAnyRole('STUDENT','PARENT','TEACHER','STAFF','SCHOOL_ADMIN','TENANT_ADMIN')")
@Tag(name = "Mobile API", description = "Role-aware endpoints for the CloudCampus mobile app")
public class MobileController {

    private final SchoolNoticeRepository noticeRepo;
    private final SchoolRepository       schoolRepo;

    public MobileController(SchoolNoticeRepository noticeRepo, SchoolRepository schoolRepo) {
        this.noticeRepo = noticeRepo;
        this.schoolRepo = schoolRepo;
    }

    @Operation(summary = "List notices for mobile",
               description = "Returns published notices relevant to the caller's role. " +
                             "TEACHER sees ALL+TEACHER; STUDENT sees ALL+STUDENT; PARENT sees ALL+PARENT. " +
                             "Ordered by priority desc, newest first.")
    @GetMapping("/notices")
    public ApiResponse<PageResponse<NoticeResponse>> notices(
            @RequestParam(defaultValue = "0")  @Min(0)         int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int limit) {

        School school   = resolveCallerSchool();
        String role     = callerRole();
        PageRequest pr  = PageRequest.of(page, limit);

        Page<SchoolNotice> result = switch (role) {
            case "TEACHER" -> noticeRepo.findPublishedForTarget(school.getId(), NoticeTarget.TEACHER, pr);
            case "STUDENT" -> noticeRepo.findPublishedForTarget(school.getId(), NoticeTarget.STUDENT, pr);
            case "PARENT"  -> noticeRepo.findPublishedForTarget(school.getId(), NoticeTarget.PARENT,  pr);
            default        -> noticeRepo.findFiltered(school.getId(), null, true, pr);
        };

        List<NoticeResponse> items = result.getContent().stream().map(NoticeResponse::from).toList();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                new PageResponse<>(items, page * limit, limit, result.getTotalElements()));
    }

    @Operation(summary = "Get a single published notice")
    @GetMapping("/notices/{id}")
    public ApiResponse<NoticeResponse> notice(@PathVariable UUID id) {
        School school = resolveCallerSchool();
        SchoolNotice notice = noticeRepo.findBySchoolIdAndId(school.getId(), id)
                .filter(SchoolNotice::isPublished)
                .orElseThrow(() -> new NotFoundException("Notice not found: " + id));
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), NoticeResponse.from(notice));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    /**
     * P0-13: resolve the school from the caller's JWT-bound schoolId
     * (populated by JwtAuthenticationFilter for every school-scoped role).
     * The repository call goes through {@link SchoolRepository#findByIdFiltered}
     * which respects the Hibernate tenant filter, so a JWT schoolId from a
     * different tenant cannot resolve. Previously hard-coded to "MAIN" school.
     */
    private School resolveCallerSchool() {
        String tenantIdStr = RequestContext.getTenantId();
        if (tenantIdStr == null) {
            throw new NotFoundException("No tenant context — caller cannot access mobile endpoints directly");
        }
        String schoolIdStr = RequestContext.getSchoolId();
        if (schoolIdStr == null) {
            throw new NotFoundException("No school context in JWT — caller is not bound to a school");
        }
        UUID schoolId = UUID.fromString(schoolIdStr);
        return schoolRepo.findByIdFiltered(schoolId)
                .orElseThrow(() -> new NotFoundException("School not found for caller: " + schoolId));
    }

    private String callerRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities().isEmpty()) return "";
        String authority = auth.getAuthorities().iterator().next().getAuthority();
        return authority.startsWith("ROLE_") ? authority.substring(5) : authority;
    }
}
