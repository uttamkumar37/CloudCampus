package com.cloudcampus.people.parent;

import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.PageResponses;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ParentDirectoryService {

    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;

    public ParentDirectoryService(
            ParentStudentLinkRepository parentStudentLinkRepository,
            SchoolRepository schoolRepository,
            SchoolAccessService schoolAccessService
    ) {
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.schoolRepository = schoolRepository;
        this.schoolAccessService = schoolAccessService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ParentDirectoryResponse> parents(AuthenticatedUser actor, int page, int size) {
        School school = requireActiveAdminSchool(actor);
        return PageResponses.of(parentStudentLinkRepository.findBySchoolIdOrderByCreatedAtDesc(school.getId())
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

    private ParentDirectoryResponse toResponse(ParentStudentLink link) {
        return new ParentDirectoryResponse(
                link.getId(),
                link.getTenant().getId(),
                link.getSchool().getId(),
                link.getParentUser().getId(),
                link.getParentUser().getDisplayName(),
                link.getParentUser().getEmail(),
                link.getParentUser().getStatus(),
                link.getStudent().getId(),
                link.getStudent().getFullName(),
                link.getStudent().getAdmissionNumber(),
                link.getRelationship(),
                link.getContactMobile(),
                link.isPrimaryContact(),
                link.getCreatedAt()
        );
    }
}
