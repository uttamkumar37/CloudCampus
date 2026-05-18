package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.WebsiteNavigationCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteNavigationUpdateRequest;
import com.cloudcampus.experience.dto.request.WebsitePageCreateRequest;
import com.cloudcampus.experience.dto.request.WebsitePageUpdateRequest;
import com.cloudcampus.experience.dto.request.WebsiteSectionCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteSectionUpdateRequest;
import com.cloudcampus.experience.dto.response.WebsiteNavigationResponse;
import com.cloudcampus.experience.dto.response.WebsitePageResponse;
import com.cloudcampus.experience.dto.response.WebsiteSectionResponse;
import com.cloudcampus.experience.entity.WebsiteNavigation;
import com.cloudcampus.experience.entity.WebsitePage;
import com.cloudcampus.experience.entity.WebsiteSection;
import com.cloudcampus.experience.repository.ExperienceWebsiteNavigationRepository;
import com.cloudcampus.experience.repository.ExperienceWebsitePageRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteSectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PageBuilderService {

    private final ExperienceWebsitePageRepository pageRepository;
    private final ExperienceWebsiteSectionRepository sectionRepository;
    private final ExperienceWebsiteNavigationRepository navigationRepository;
    private final WebsiteSchemaValidator websiteSchemaValidator;
    private final WebsiteAuditTimelineService auditTimelineService;

    public PageBuilderService(ExperienceWebsitePageRepository pageRepository,
                              ExperienceWebsiteSectionRepository sectionRepository,
                              ExperienceWebsiteNavigationRepository navigationRepository,
                              WebsiteSchemaValidator websiteSchemaValidator,
                              WebsiteAuditTimelineService auditTimelineService) {
        this.pageRepository = pageRepository;
        this.sectionRepository = sectionRepository;
        this.navigationRepository = navigationRepository;
        this.websiteSchemaValidator = websiteSchemaValidator;
        this.auditTimelineService = auditTimelineService;
    }

    public List<WebsitePageResponse> listPages() {
        return pageRepository.findByDeletedFalseOrderByUpdatedAtDesc().stream().map(WebsitePageResponse::from).toList();
    }

    @Transactional
    public WebsitePageResponse createPage(WebsitePageCreateRequest req, UUID actorId) {
        websiteSchemaValidator.validateCreatePage(req);
        WebsitePage page = WebsitePage.create(
                req.pageKey(),
                req.title(),
                req.slug(),
                nullSafeMap(req.seoJson()),
                nullSafeMap(req.settingsJson()),
                actorId
        );
        WebsitePage saved = pageRepository.save(page);
        auditTimelineService.record(
                "PAGE_CREATED",
                "PAGE",
                saved.getId(),
                saved.getTitle(),
                actorId,
                Map.of("slug", saved.getSlug(), "pageKey", saved.getPageKey())
        );
        return WebsitePageResponse.from(saved);
    }

    @Transactional
    public WebsitePageResponse updatePage(UUID id, WebsitePageUpdateRequest req, UUID actorId) {
        websiteSchemaValidator.validateUpdatePage(req);
        WebsitePage page = pageRepository.findById(id).orElseThrow(() -> new NotFoundException("Website page not found"));
        page.update(req.title(), req.slug(), nullSafeMap(req.seoJson()), nullSafeMap(req.settingsJson()));
        WebsitePage saved = pageRepository.save(page);
        auditTimelineService.record(
                "PAGE_UPDATED",
                "PAGE",
                saved.getId(),
                saved.getTitle(),
                actorId,
                Map.of("slug", saved.getSlug(), "version", saved.getVersion())
        );
        return WebsitePageResponse.from(saved);
    }

    @Transactional
    public WebsitePageResponse publishPage(UUID id, UUID actorId) {
        WebsitePage page = pageRepository.findById(id).orElseThrow(() -> new NotFoundException("Website page not found"));
        page.publish();
        WebsitePage saved = pageRepository.save(page);
        auditTimelineService.record(
                "PAGE_PUBLISHED",
                "PAGE",
                saved.getId(),
                saved.getTitle(),
                actorId,
                Map.of("slug", saved.getSlug(), "version", saved.getVersion())
        );
        return WebsitePageResponse.from(saved);
    }

    public List<WebsiteSectionResponse> listSections(UUID pageId) {
        return sectionRepository.findByPageIdOrderByPositionAsc(pageId).stream().map(WebsiteSectionResponse::from).toList();
    }

    @Transactional
    public WebsiteSectionResponse createSection(UUID pageId, WebsiteSectionCreateRequest req, UUID actorId) {
        websiteSchemaValidator.validateCreateSection(req);
        if (pageRepository.findById(pageId).isEmpty()) {
            throw new NotFoundException("Website page not found");
        }
        WebsiteSection section = WebsiteSection.create(
                pageId,
                req.sectionKey(),
                req.title(),
                req.sectionType(),
                req.position(),
                nullSafeMap(req.configJson()),
                actorId
        );
        WebsiteSection saved = sectionRepository.save(section);
        auditTimelineService.record(
                "SECTION_CREATED",
                "SECTION",
                saved.getId(),
                saved.getTitle(),
                actorId,
                Map.of("pageId", pageId.toString(), "sectionType", saved.getSectionType(), "position", saved.getPosition())
        );
        return WebsiteSectionResponse.from(saved);
    }

    @Transactional
    public WebsiteSectionResponse updateSection(UUID sectionId, WebsiteSectionUpdateRequest req, UUID actorId) {
        websiteSchemaValidator.validateUpdateSection(req);
        WebsiteSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("Website section not found"));
        section.update(req.title(), req.sectionType(), req.position(), nullSafeMap(req.configJson()));
        WebsiteSection saved = sectionRepository.save(section);
        auditTimelineService.record(
                "SECTION_UPDATED",
                "SECTION",
                saved.getId(),
                saved.getTitle(),
                actorId,
                Map.of("pageId", saved.getPageId().toString(), "sectionType", saved.getSectionType(), "position", saved.getPosition())
        );
        return WebsiteSectionResponse.from(saved);
    }

    @Transactional
    public WebsiteSectionResponse publishSection(UUID sectionId, UUID actorId) {
        WebsiteSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("Website section not found"));
        section.publish();
        WebsiteSection saved = sectionRepository.save(section);
        auditTimelineService.record(
                "SECTION_PUBLISHED",
                "SECTION",
                saved.getId(),
                saved.getTitle(),
                actorId,
                Map.of("pageId", saved.getPageId().toString(), "sectionType", saved.getSectionType())
        );
        return WebsiteSectionResponse.from(saved);
    }

    public List<WebsiteNavigationResponse> listNavigation() {
        return navigationRepository.findAllByOrderByGroupNameAscPositionAsc().stream().map(WebsiteNavigationResponse::from).toList();
    }

    @Transactional
    public WebsiteNavigationResponse createNavigation(WebsiteNavigationCreateRequest req, UUID actorId) {
        websiteSchemaValidator.validateCreateNavigation(req);
        WebsiteNavigation navigation = WebsiteNavigation.create(
                req.label(),
                req.path(),
                req.target(),
                req.groupName(),
                req.position(),
                req.visible(),
                actorId
        );
        WebsiteNavigation saved = navigationRepository.save(navigation);
        auditTimelineService.record(
                "NAVIGATION_CREATED",
                "NAVIGATION",
                saved.getId(),
                saved.getLabel(),
                actorId,
                Map.of("path", saved.getPath(), "groupName", saved.getGroupName(), "visible", saved.isVisible())
        );
        return WebsiteNavigationResponse.from(saved);
    }

    @Transactional
    public WebsiteNavigationResponse updateNavigation(UUID id, WebsiteNavigationUpdateRequest req, UUID actorId) {
        websiteSchemaValidator.validateUpdateNavigation(req);
        WebsiteNavigation navigation = navigationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Website navigation not found"));
        navigation.update(req.label(), req.path(), req.target(), req.groupName(), req.position(), req.visible());
        WebsiteNavigation saved = navigationRepository.save(navigation);
        auditTimelineService.record(
                "NAVIGATION_UPDATED",
                "NAVIGATION",
                saved.getId(),
                saved.getLabel(),
                actorId,
                Map.of("path", saved.getPath(), "groupName", saved.getGroupName(), "visible", saved.isVisible())
        );
        return WebsiteNavigationResponse.from(saved);
    }

    @Transactional
    public WebsiteNavigationResponse publishNavigation(UUID id, UUID actorId) {
        WebsiteNavigation navigation = navigationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Website navigation not found"));
        navigation.publish();
        WebsiteNavigation saved = navigationRepository.save(navigation);
        auditTimelineService.record(
                "NAVIGATION_PUBLISHED",
                "NAVIGATION",
                saved.getId(),
                saved.getLabel(),
                actorId,
                Map.of("path", saved.getPath(), "groupName", saved.getGroupName())
        );
        return WebsiteNavigationResponse.from(saved);
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Map.of() : input;
    }
}
