package com.cloudcampus.people.parent;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ParentLeaveRequestService {

    private final ParentLeaveRequestRepository parentLeaveRequestRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;

    public ParentLeaveRequestService(
            ParentLeaveRequestRepository parentLeaveRequestRepository,
            ParentStudentLinkRepository parentStudentLinkRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService
    ) {
        this.parentLeaveRequestRepository = parentLeaveRequestRepository;
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ParentLeaveRequestResponse create(
            AuthenticatedUser parent,
            String studentId,
            ParentLeaveRequestCreateRequest request
    ) {
        ParentStudentLink linkedChild = requireLinkedChild(parent, studentId);
        validateDates(request);
        ParentLeaveRequest leaveRequest = parentLeaveRequestRepository.save(new ParentLeaveRequest(
                linkedChild,
                request.startDate(),
                request.endDate(),
                normalizeRequired(request.reason())
        ));
        auditLogService.record(
                leaveRequest.getTenant().getId(),
                leaveRequest.getSchool().getId(),
                parent.user().getRole().name(),
                parent.user().getId(),
                AuditAction.PARENT_LEAVE_REQUESTED,
                "ParentLeaveRequest",
                leaveRequest.getId(),
                "Parent requested student leave.",
                Map.of(
                        "actorRole", parent.user().getRole().name(),
                        "studentId", leaveRequest.getStudent().getId(),
                        "parentUserId", leaveRequest.getParentUser().getId(),
                        "startDate", leaveRequest.getStartDate().toString(),
                        "endDate", leaveRequest.getEndDate().toString()
                )
        );
        return ParentLeaveRequestResponse.from(leaveRequest);
    }

    @Transactional(readOnly = true)
    public List<ParentLeaveRequestResponse> parentRequests(AuthenticatedUser parent, String studentId) {
        requireLinkedChild(parent, studentId);
        return parentLeaveRequestRepository.findByParentUserIdAndStudentIdOrderByCreatedAtDesc(
                        parent.user().getId(),
                        studentId
                )
                .stream()
                .map(ParentLeaveRequestResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ParentLeaveRequestResponse> schoolRequests(AuthenticatedUser actor) {
        String activeSchoolId = requireActiveSchoolAdmin(actor);
        return parentLeaveRequestRepository.findBySchoolIdOrderByCreatedAtDesc(activeSchoolId)
                .stream()
                .map(ParentLeaveRequestResponse::from)
                .toList();
    }

    @Transactional
    public ParentLeaveRequestResponse decide(
            AuthenticatedUser actor,
            String leaveRequestId,
            ParentLeaveDecisionRequest request
    ) {
        ParentLeaveRequest leaveRequest = parentLeaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new NotFoundException("Leave request was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), leaveRequest.getSchool().getId());
        if (request.status() == ParentLeaveRequestStatus.PENDING) {
            throw new BadRequestException("Decision must approve or reject the leave request.");
        }
        if (leaveRequest.getStatus() != ParentLeaveRequestStatus.PENDING) {
            throw new ConflictException("Leave request has already been decided.");
        }
        leaveRequest.decide(request.status(), normalizeOptional(request.adminNote()), actor.user(), Instant.now());
        auditLogService.record(
                leaveRequest.getTenant().getId(),
                leaveRequest.getSchool().getId(),
                actor.user().getRole().name(),
                actor.user().getId(),
                AuditAction.PARENT_LEAVE_DECIDED,
                "ParentLeaveRequest",
                leaveRequest.getId(),
                "Parent leave request decision recorded.",
                Map.of(
                        "actorRole", actor.user().getRole().name(),
                        "studentId", leaveRequest.getStudent().getId(),
                        "parentUserId", leaveRequest.getParentUser().getId(),
                        "decision", request.status().name()
                )
        );
        return ParentLeaveRequestResponse.from(leaveRequest);
    }

    private ParentStudentLink requireLinkedChild(AuthenticatedUser actor, String studentId) {
        if (actor.user().getRole() != UserRole.PARENT) {
            throw new ForbiddenException("Only linked parents can access this child.");
        }
        ParentStudentLink linkedChild = parentStudentLinkRepository
                .findByParentUserIdAndStudentId(actor.user().getId(), studentId)
                .orElseThrow(() -> new ForbiddenException("Parent is not linked to this child."));
        if (!linkedChild.getTenant().getId().equals(actor.user().getTenant().getId())
                || !linkedChild.getStudent().getTenant().getId().equals(actor.user().getTenant().getId())
                || !linkedChild.getSchool().getTenant().getId().equals(actor.user().getTenant().getId())) {
            throw new ForbiddenException("Parent link tenant scope is invalid.");
        }
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required for parent access.");
        }
        if (!linkedChild.getSchool().getId().equals(activeSchoolId)) {
            throw new ForbiddenException("Parent is not linked to this child in the active school.");
        }
        return linkedChild;
    }

    private String requireActiveSchoolAdmin(AuthenticatedUser actor) {
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), activeSchoolId);
        return activeSchoolId;
    }

    private void validateDates(ParentLeaveRequestCreateRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException("Leave end date cannot be before start date.");
        }
    }

    private String normalizeRequired(String value) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isBlank()) {
            throw new BadRequestException("Leave reason is required.");
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        String normalized = value == null ? null : value.trim();
        return normalized == null || normalized.isBlank() ? null : normalized;
    }
}
