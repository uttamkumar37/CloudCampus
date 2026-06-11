package com.cloudcampus.people.parent;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.context.RequestContext;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.accesscontrol.guard.AuthorizationGuard;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ParentLeaveRequestService {

    private final ParentLeaveRequestRepository parentLeaveRequestRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;
    private final AuthorizationGuard authorizationGuard;

    public ParentLeaveRequestService(
            ParentLeaveRequestRepository parentLeaveRequestRepository,
            ParentStudentLinkRepository parentStudentLinkRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService,
            AuthorizationGuard authorizationGuard
    ) {
        this.parentLeaveRequestRepository = parentLeaveRequestRepository;
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
        this.authorizationGuard = authorizationGuard;
    }

    @Transactional
    public ParentLeaveRequestResponse create(
            RequestContext parent,
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
                "PARENT",
                parent.userId().toString(),
                AuditAction.PARENT_LEAVE_REQUESTED,
                "ParentLeaveRequest",
                leaveRequest.getId(),
                "Parent requested student leave.",
                Map.of(
                        "actorRole", "PARENT",
                        "studentId", leaveRequest.getStudent().getId(),
                        "parentUserId", leaveRequest.getParentUser().getId(),
                        "startDate", leaveRequest.getStartDate().toString(),
                        "endDate", leaveRequest.getEndDate().toString()
                )
        );
        return ParentLeaveRequestResponse.from(leaveRequest);
    }

    @Transactional(readOnly = true)
    public List<ParentLeaveRequestResponse> parentRequests(RequestContext parent, String studentId) {
        requireLinkedChild(parent, studentId);
        return parentLeaveRequestRepository.findByParentUserIdAndStudentIdOrderByCreatedAtDesc(
                        parent.userId().toString(),
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

    private ParentStudentLink requireLinkedChild(RequestContext actor, String studentId) {
        authorizationGuard.requireRole(actor, "PARENT");
        authorizationGuard.requireStudentRecordVisible(actor, studentId);
        ParentStudentLink linkedChild = parentStudentLinkRepository
                .findByParentUserIdAndStudentId(actor.userId().toString(), studentId)
                .orElseThrow(() -> new ForbiddenException("Parent is not linked to this child."));
        String tenantId = actor.tenantId().toString();
        if (!linkedChild.getTenant().getId().equals(tenantId)
                || !linkedChild.getStudent().getTenant().getId().equals(tenantId)
                || !linkedChild.getSchool().getTenant().getId().equals(tenantId)) {
            throw new ForbiddenException("Parent link tenant scope is invalid.");
        }
        if (!linkedChild.getSchool().getId().equals(actor.activeSchoolId().toString())) {
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
