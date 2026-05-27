package com.cloudcampus.operations.website;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WebsiteService {

    private final WebsitePageRepository websitePageRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;

    public WebsiteService(
            WebsitePageRepository websitePageRepository,
            SchoolRepository schoolRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService
    ) {
        this.websitePageRepository = websitePageRepository;
        this.schoolRepository = schoolRepository;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public WebsitePageResponse create(AuthenticatedUser actor, WebsitePageRequest request) {
        School school = requireActiveSchoolAdminSchool(actor);
        String slug = request.slug().trim().toLowerCase();
        if (websitePageRepository.existsBySchoolIdAndSlug(school.getId(), slug)) {
            throw new ConflictException("Website page slug is already used for this school.");
        }
        WebsitePage page = websitePageRepository.save(new WebsitePage(
                school,
                actor.user(),
                slug,
                request.title().trim(),
                request.body().trim()
        ));
        recordCreated(actor.user(), page);
        return toResponse(page);
    }

    @Transactional(readOnly = true)
    public List<WebsitePageResponse> list(AuthenticatedUser actor) {
        School school = requireActiveSchoolAdminSchool(actor);
        return websitePageRepository.findBySchoolIdOrderByCreatedAtDesc(school.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WebsitePageResponse read(AuthenticatedUser actor, String pageId) {
        WebsitePage page = websitePageRepository.findById(pageId)
                .orElseThrow(() -> new NotFoundException("Website page was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), page.getSchool().getId());
        return toResponse(page);
    }

    @Transactional
    public WebsitePageResponse publish(AuthenticatedUser actor, String pageId) {
        WebsitePage page = websitePageRepository.findById(pageId)
                .orElseThrow(() -> new NotFoundException("Website page was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), page.getSchool().getId());
        page.publish(actor.user(), Instant.now());
        recordPublished(actor.user(), page);
        return toResponse(page);
    }

    private School requireActiveSchoolAdminSchool(AuthenticatedUser actor) {
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), activeSchoolId);
        return schoolRepository.findById(activeSchoolId)
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private WebsitePageResponse toResponse(WebsitePage page) {
        return new WebsitePageResponse(
                page.getId(),
                page.getTenant().getId(),
                page.getSchool().getId(),
                page.getSlug(),
                page.getTitle(),
                page.getBody(),
                page.getStatus(),
                page.getCreatedAt(),
                page.getPublishedAt()
        );
    }

    private void recordCreated(UserAccount actor, WebsitePage page) {
        auditLogService.record(
                page.getTenant().getId(),
                page.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.WEBSITE_PAGE_CREATED,
                "WebsitePage",
                page.getId(),
                "Website page created",
                metadata(page)
        );
    }

    private void recordPublished(UserAccount actor, WebsitePage page) {
        auditLogService.record(
                page.getTenant().getId(),
                page.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.WEBSITE_PAGE_PUBLISHED,
                "WebsitePage",
                page.getId(),
                "Website page published",
                metadata(page)
        );
    }

    private Map<String, Object> metadata(WebsitePage page) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("slug", page.getSlug());
        metadata.put("status", page.getStatus().name());
        return metadata;
    }
}
