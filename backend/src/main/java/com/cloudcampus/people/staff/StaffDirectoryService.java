package com.cloudcampus.people.staff;

import java.util.List;

import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.PageResponses;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StaffDirectoryService {

    private final StaffProfileRepository staffProfileRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;

    public StaffDirectoryService(
            StaffProfileRepository staffProfileRepository,
            SchoolRepository schoolRepository,
            SchoolAccessService schoolAccessService
    ) {
        this.staffProfileRepository = staffProfileRepository;
        this.schoolRepository = schoolRepository;
        this.schoolAccessService = schoolAccessService;
    }

    @Transactional(readOnly = true)
    public PageResponse<StaffDirectoryResponse> staff(AuthenticatedUser actor, int page, int size) {
        School school = requireActiveAdminSchool(actor);
        return PageResponses.of(staffProfileRepository.findBySchoolIdOrderByFullNameAsc(school.getId())
                .stream()
                .map(this::toResponse)
                .toList(), page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<StaffDirectoryResponse> teachers(AuthenticatedUser actor, int page, int size) {
        School school = requireActiveAdminSchool(actor);
        return PageResponses.of(staffProfileRepository.findBySchoolIdAndRoleOrderByFullNameAsc(school.getId(), UserRole.TEACHER)
                .stream()
                .map(this::toResponse)
                .toList(), page, size);
    }

    private School requireActiveAdminSchool(AuthenticatedUser actor) {
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), activeSchoolId);
        return schoolRepository.findById(activeSchoolId)
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private StaffDirectoryResponse toResponse(StaffProfile profile) {
        return new StaffDirectoryResponse(
                profile.getId(),
                profile.getTenant().getId(),
                profile.getSchool().getId(),
                profile.getUser().getId(),
                profile.getEmail(),
                profile.getFullName(),
                profile.getRole(),
                profile.getUser().getStatus(),
                profile.getEmployeeNumber(),
                profile.getDepartment(),
                profile.getDesignation(),
                profile.isPortalLoginRequired(),
                profile.isActive(),
                profile.getCreatedAt()
        );
    }
}
