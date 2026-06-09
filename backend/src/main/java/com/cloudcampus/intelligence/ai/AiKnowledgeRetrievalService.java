package com.cloudcampus.intelligence.ai;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.people.parent.ParentStudentLink;
import com.cloudcampus.people.parent.ParentStudentLinkRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiKnowledgeRetrievalService {

    private static final AiFeature FIRST_VERSION_FEATURE = AiFeature.SCHOOL_POLICY_QA;
    private static final int DEFAULT_LIMIT = 5;
    private static final int MAX_LIMIT = 10;

    private final AiKnowledgeDocumentRepository aiKnowledgeDocumentRepository;
    private final AiTenantEntitlementRepository aiTenantEntitlementRepository;
    private final AiRetrievalAuditRepository aiRetrievalAuditRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;
    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final StudentRepository studentRepository;
    private final AuditLogService auditLogService;

    public AiKnowledgeRetrievalService(
            AiKnowledgeDocumentRepository aiKnowledgeDocumentRepository,
            AiTenantEntitlementRepository aiTenantEntitlementRepository,
            AiRetrievalAuditRepository aiRetrievalAuditRepository,
            SchoolRepository schoolRepository,
            SchoolAccessService schoolAccessService,
            UserSchoolAccessRepository userSchoolAccessRepository,
            ParentStudentLinkRepository parentStudentLinkRepository,
            StudentRepository studentRepository,
            AuditLogService auditLogService
    ) {
        this.aiKnowledgeDocumentRepository = aiKnowledgeDocumentRepository;
        this.aiTenantEntitlementRepository = aiTenantEntitlementRepository;
        this.aiRetrievalAuditRepository = aiRetrievalAuditRepository;
        this.schoolRepository = schoolRepository;
        this.schoolAccessService = schoolAccessService;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.studentRepository = studentRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AiKnowledgeDocumentResponse createKnowledgeDocument(
            AuthenticatedUser authenticatedUser,
            AiKnowledgeDocumentRequest request
    ) {
        UserAccount actor = authenticatedUser.user();
        School school = requireActiveSchoolAdminSchool(authenticatedUser);
        AiKnowledgeDocument document = aiKnowledgeDocumentRepository.save(new AiKnowledgeDocument(
                school,
                request.title(),
                request.category(),
                request.content(),
                visibleRoles(request),
                actor
        ));
        recordKnowledgeDocumentCreated(actor, document);
        return documentResponse(document);
    }

    @Transactional(readOnly = true)
    public List<AiKnowledgeDocumentResponse> listKnowledgeDocuments(AuthenticatedUser authenticatedUser) {
        School school = requireActiveSchoolAdminSchool(authenticatedUser);
        return aiKnowledgeDocumentRepository
                .findBySchoolIdAndStatusOrderByCreatedAtDesc(school.getId(), AiKnowledgeDocumentStatus.ACTIVE)
                .stream()
                .map(this::documentResponse)
                .toList();
    }

    @Transactional(noRollbackFor = ForbiddenException.class)
    public AiScopedRetrievalResponse search(AuthenticatedUser authenticatedUser, AiScopedRetrievalRequest request) {
        UserAccount actor = authenticatedUser.user();
        Tenant tenant = actor.getTenant();
        String queryHash = sha256(request.query());
        School scopeSchool = resolveRetrievalSchool(authenticatedUser, request);
        AiTenantEntitlement entitlement = aiTenantEntitlementRepository.findById(tenant.getId()).orElse(null);
        if (entitlement == null || !entitlement.isEnabled() || !entitlement.getEnabledFeatures().contains(FIRST_VERSION_FEATURE)) {
            AiRetrievalAudit denied = saveRetrievalAudit(
                    tenant,
                    scopeSchool,
                    actor,
                    request.query(),
                    0,
                    AiUsageStatus.DENIED,
                    "AI school policy retrieval is not enabled for this tenant."
            );
            recordRetrievalDenied(actor, denied);
            throw new ForbiddenException("AI school policy retrieval is not enabled for this tenant.");
        }

        List<AiKnowledgeResultResponse> results = aiKnowledgeDocumentRepository
                .findBySchoolIdAndStatusOrderByCreatedAtDesc(scopeSchool.getId(), AiKnowledgeDocumentStatus.ACTIVE)
                .stream()
                .filter(document -> document.getTenant().getId().equals(tenant.getId()))
                .filter(document -> document.getVisibleToRoles().contains(actor.getRole()))
                .filter(document -> matches(document, request.query()))
                .limit(limit(request.limit()))
                .map(this::resultResponse)
                .toList();

        AiRetrievalAudit audit = saveRetrievalAudit(
                tenant,
                scopeSchool,
                actor,
                request.query(),
                results.size(),
                AiUsageStatus.AUTHORIZED,
                null
        );
        recordRetrievalAudited(actor, audit);
        return new AiScopedRetrievalResponse(
                tenant.getId(),
                scopeSchool.getId(),
                actor.getId(),
                actor.getRole().name(),
                queryHash,
                results.size(),
                results
        );
    }

    private School requireActiveSchoolAdminSchool(AuthenticatedUser authenticatedUser) {
        String activeSchoolId = authenticatedUser.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolAdminAccess(authenticatedUser.user().getId(), activeSchoolId);
        return schoolRepository.findById(activeSchoolId)
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private School resolveRetrievalSchool(AuthenticatedUser authenticatedUser, AiScopedRetrievalRequest request) {
        UserAccount actor = authenticatedUser.user();
        return switch (actor.getRole()) {
            case SCHOOL_ADMIN, PRINCIPAL, STAFF, OFFICE_STAFF, FINANCE_STAFF -> schoolFromActiveGrant(authenticatedUser);
            case TEACHER -> schoolForTeacher(authenticatedUser);
            case PARENT -> schoolForLinkedChild(authenticatedUser, request.studentId());
            case STUDENT -> schoolForStudent(actor);
            case SUPER_ADMIN, TENANT_ADMIN -> throw new ForbiddenException("Portal user school context is required for AI retrieval.");
            case GUEST, SYSTEM, AI_AGENT -> throw new ForbiddenException("This role cannot use school-scoped AI retrieval.");
        };
    }

    private School schoolFromActiveGrant(AuthenticatedUser authenticatedUser) {
        String activeSchoolId = authenticatedUser.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required for AI retrieval.");
        }
        UserSchoolAccess access = userSchoolAccessRepository
                .findByUserIdAndSchoolId(authenticatedUser.user().getId(), activeSchoolId)
                .orElseThrow(() -> new ForbiddenException("User is not allowed to access this school."));
        if (!access.getTenant().getId().equals(authenticatedUser.user().getTenant().getId())
                || !access.getSchool().getTenant().getId().equals(authenticatedUser.user().getTenant().getId())) {
            throw new ForbiddenException("School access grant tenant scope is invalid.");
        }
        return access.getSchool();
    }

    private School schoolForTeacher(AuthenticatedUser authenticatedUser) {
        School school = schoolFromActiveGrant(authenticatedUser);
        UserRole grantedRole = userSchoolAccessRepository
                .findByUserIdAndSchoolId(authenticatedUser.user().getId(), school.getId())
                .map(UserSchoolAccess::getRole)
                .orElseThrow(() -> new ForbiddenException("Teacher is not assigned to this school."));
        if (grantedRole != UserRole.TEACHER) {
            throw new ForbiddenException("Teacher assignment is required for AI retrieval.");
        }
        return school;
    }

    private School schoolForLinkedChild(AuthenticatedUser authenticatedUser, String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new ForbiddenException("A linked child is required for parent AI retrieval.");
        }
        School activeSchool = schoolFromActiveGrant(authenticatedUser);
        UserAccount parent = authenticatedUser.user();
        ParentStudentLink link = parentStudentLinkRepository
                .findByParentUserIdAndStudentId(parent.getId(), studentId)
                .orElseThrow(() -> new ForbiddenException("Parent is not linked to this child."));
        if (!link.getTenant().getId().equals(parent.getTenant().getId())
                || !link.getStudent().getTenant().getId().equals(parent.getTenant().getId())) {
            throw new ForbiddenException("Parent-child tenant scope is invalid.");
        }
        if (!link.getSchool().getId().equals(activeSchool.getId())) {
            throw new ForbiddenException("Parent is not linked to this child in the active school.");
        }
        return link.getSchool();
    }

    private School schoolForStudent(UserAccount actor) {
        Student student = studentRepository.findByUserId(actor.getId())
                .orElseThrow(() -> new ForbiddenException("Student profile is required for AI retrieval."));
        if (!student.getTenant().getId().equals(actor.getTenant().getId())) {
            throw new ForbiddenException("Student tenant scope is invalid.");
        }
        return student.getSchool();
    }

    private Set<UserRole> visibleRoles(AiKnowledgeDocumentRequest request) {
        if (request.visibleToRoles() == null || request.visibleToRoles().isEmpty()) {
            return EnumSet.of(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.STUDENT);
        }
        EnumSet<UserRole> roles = EnumSet.noneOf(UserRole.class);
        roles.addAll(request.visibleToRoles());
        roles.remove(UserRole.SUPER_ADMIN);
        roles.remove(UserRole.TENANT_ADMIN);
        if (roles.isEmpty()) {
            throw new ForbiddenException("Knowledge documents must be visible to at least one school portal role.");
        }
        return roles;
    }

    private boolean matches(AiKnowledgeDocument document, String query) {
        String normalizedQuery = normalize(query);
        if (normalizedQuery.isBlank()) {
            return false;
        }
        String corpus = normalize(document.getTitle() + " " + document.getContent());
        for (String token : normalizedQuery.split("\\s+")) {
            if (token.length() >= 3 && corpus.contains(token)) {
                return true;
            }
        }
        return false;
    }

    private int limit(Integer requestedLimit) {
        if (requestedLimit == null) {
            return DEFAULT_LIMIT;
        }
        return Math.max(1, Math.min(requestedLimit, MAX_LIMIT));
    }

    private AiKnowledgeDocumentResponse documentResponse(AiKnowledgeDocument document) {
        return new AiKnowledgeDocumentResponse(
                document.getId(),
                document.getTenant().getId(),
                document.getSchool().getId(),
                document.getTitle(),
                document.getCategory(),
                document.getVisibleToRoles().stream().sorted(Comparator.comparing(Enum::name)).toList(),
                document.getStatus(),
                document.getCreatedBy().getId(),
                document.getCreatedAt()
        );
    }

    private AiKnowledgeResultResponse resultResponse(AiKnowledgeDocument document) {
        return new AiKnowledgeResultResponse(
                document.getId(),
                document.getTenant().getId(),
                document.getSchool().getId(),
                document.getTitle(),
                document.getCategory(),
                snippet(document.getContent())
        );
    }

    private AiRetrievalAudit saveRetrievalAudit(
            Tenant tenant,
            School school,
            UserAccount actor,
            String query,
            int resultCount,
            AiUsageStatus status,
            String denialReason
    ) {
        return aiRetrievalAuditRepository.save(new AiRetrievalAudit(
                tenant,
                school,
                actor,
                FIRST_VERSION_FEATURE,
                sha256(query),
                query.length(),
                resultCount,
                status,
                denialReason
        ));
    }

    private void recordKnowledgeDocumentCreated(UserAccount actor, AiKnowledgeDocument document) {
        auditLogService.record(
                document.getTenant().getId(),
                document.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.AI_KNOWLEDGE_DOCUMENT_CREATED,
                "AiKnowledgeDocument",
                document.getId(),
                "AI knowledge document created.",
                Map.of(
                        "tenantId", document.getTenant().getId(),
                        "schoolId", document.getSchool().getId(),
                        "documentId", document.getId(),
                        "category", document.getCategory().name(),
                        "visibleToRoles", document.getVisibleToRoles().stream().map(UserRole::name).sorted().toList()
                )
        );
    }

    private void recordRetrievalAudited(UserAccount actor, AiRetrievalAudit audit) {
        recordRetrievalAudit(actor, audit, AuditAction.AI_RETRIEVAL_AUDITED, "AI scoped retrieval completed.");
    }

    private void recordRetrievalDenied(UserAccount actor, AiRetrievalAudit audit) {
        recordRetrievalAudit(actor, audit, AuditAction.AI_RETRIEVAL_DENIED, "AI scoped retrieval denied.");
    }

    private void recordRetrievalAudit(UserAccount actor, AiRetrievalAudit audit, AuditAction action, String summary) {
        auditLogService.record(
                audit.getTenant().getId(),
                audit.getSchool() == null ? null : audit.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                action,
                "AiRetrievalAudit",
                audit.getId(),
                summary,
                retrievalMetadata(audit)
        );
    }

    private Map<String, ?> retrievalMetadata(AiRetrievalAudit audit) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("tenantId", audit.getTenant().getId());
        metadata.put("schoolId", audit.getSchool() == null ? "" : audit.getSchool().getId());
        metadata.put("userId", audit.getUser().getId());
        metadata.put("role", audit.getUserRole().name());
        metadata.put("feature", audit.getFeature().name());
        metadata.put("querySha256", audit.getQuerySha256());
        metadata.put("queryLength", audit.getQueryLength());
        metadata.put("resultCount", audit.getResultCount());
        metadata.put("status", audit.getStatus().name());
        metadata.put("denialReason", audit.getDenialReason() == null ? "" : audit.getDenialReason());
        return metadata;
    }

    private String snippet(String content) {
        String compact = content.replaceAll("\\s+", " ").trim();
        return compact.length() <= 220 ? compact : compact.substring(0, 217) + "...";
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", " ").trim();
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable.", exception);
        }
    }
}
