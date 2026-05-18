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

    public PageBuilderService(ExperienceWebsitePageRepository pageRepository,
                              ExperienceWebsiteSectionRepository sectionRepository,
                              ExperienceWebsiteNavigationRepository navigationRepository) {
        this.pageRepository = pageRepository;
        this.sectionRepository = sectionRepository;
        this.navigationRepository = navigationRepository;
    }

    public List<WebsitePageResponse> listPages() {
        return pageRepository.findByDeletedFalseOrderByUpdatedAtDesc().stream().map(WebsitePageResponse::from).toList();
    }

    @Transactional
    public WebsitePageResponse createPage(WebsitePageCreateRequest req, UUID actorId) {
        WebsitePage page = WebsitePage.create(
                req.pageKey(),
                req.title(),
                req.slug(),
                nullSafeMap(req.seoJson()),
                nullSafeMap(req.settingsJson()),
                actorId
        );
        return WebsitePageResponse.from(pageRepository.save(page));
    }

    @Transactional
    public WebsitePageResponse updatePage(UUID id, WebsitePageUpdateRequest req) {
        WebsitePage page = pageRepository.findById(id).orElseThrow(() -> new NotFoundException("Website page not found"));
        page.update(req.title(), req.slug(), nullSafeMap(req.seoJson()), nullSafeMap(req.settingsJson()));
        return WebsitePageResponse.from(pageRepository.save(page));
    }

    @Transactional
    public WebsitePageResponse publishPage(UUID id) {
        WebsitePage page = pageRepository.findById(id).orElseThrow(() -> new NotFoundException("Website page not found"));
        page.publish();
        return WebsitePageResponse.from(pageRepository.save(page));
    }

    public List<WebsiteSectionResponse> listSections(UUID pageId) {
        return sectionRepository.findByPageIdOrderByPositionAsc(pageId).stream().map(WebsiteSectionResponse::from).toList();
    }

    @Transactional
    public WebsiteSectionResponse createSection(UUID pageId, WebsiteSectionCreateRequest req, UUID actorId) {
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
        return WebsiteSectionResponse.from(sectionRepository.save(section));
    }

    @Transactional
    public WebsiteSectionResponse updateSection(UUID sectionId, WebsiteSectionUpdateRequest req) {
        WebsiteSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("Website section not found"));
        section.update(req.title(), req.sectionType(), req.position(), nullSafeMap(req.configJson()));
        return WebsiteSectionResponse.from(sectionRepository.save(section));
    }

    @Transactional
    public WebsiteSectionResponse publishSection(UUID sectionId) {
        WebsiteSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("Website section not found"));
        section.publish();
        return WebsiteSectionResponse.from(sectionRepository.save(section));
    }

    public List<WebsiteNavigationResponse> listNavigation() {
        return navigationRepository.findAllByOrderByGroupNameAscPositionAsc().stream().map(WebsiteNavigationResponse::from).toList();
    }

    @Transactional
    public WebsiteNavigationResponse createNavigation(WebsiteNavigationCreateRequest req, UUID actorId) {
        WebsiteNavigation navigation = WebsiteNavigation.create(
                req.label(),
                req.path(),
                req.target(),
                req.groupName(),
                req.position(),
                req.visible(),
                actorId
        );
        return WebsiteNavigationResponse.from(navigationRepository.save(navigation));
    }

    @Transactional
    public WebsiteNavigationResponse updateNavigation(UUID id, WebsiteNavigationUpdateRequest req) {
        WebsiteNavigation navigation = navigationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Website navigation not found"));
        navigation.update(req.label(), req.path(), req.target(), req.groupName(), req.position(), req.visible());
        return WebsiteNavigationResponse.from(navigationRepository.save(navigation));
    }

    @Transactional
    public WebsiteNavigationResponse publishNavigation(UUID id) {
        WebsiteNavigation navigation = navigationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Website navigation not found"));
        navigation.publish();
        return WebsiteNavigationResponse.from(navigationRepository.save(navigation));
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Map.of() : input;
    }
}
