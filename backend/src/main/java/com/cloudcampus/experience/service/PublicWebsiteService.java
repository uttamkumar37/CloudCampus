package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.response.PublicWebsiteDashboardResponse;
import com.cloudcampus.experience.dto.response.WebsiteNavigationResponse;
import com.cloudcampus.experience.dto.response.WebsitePageResponse;
import com.cloudcampus.experience.dto.response.WebsiteSectionResponse;
import com.cloudcampus.experience.dto.response.WebsiteThemeResponse;
import com.cloudcampus.experience.repository.ExperienceEventRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteNavigationRepository;
import com.cloudcampus.experience.repository.ExperienceWebsitePageRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteSectionRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteSeoSettingsRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteThemeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class PublicWebsiteService {

    private final ExperienceWebsitePageRepository pageRepository;
    private final ExperienceWebsiteSectionRepository sectionRepository;
    private final ExperienceWebsiteThemeRepository themeRepository;
    private final ExperienceWebsiteNavigationRepository navigationRepository;
    private final ExperienceWebsiteSeoSettingsRepository seoSettingsRepository;
    private final ExperienceEventRepository eventRepository;

    public PublicWebsiteService(ExperienceWebsitePageRepository pageRepository,
                                ExperienceWebsiteSectionRepository sectionRepository,
                                ExperienceWebsiteThemeRepository themeRepository,
                                ExperienceWebsiteNavigationRepository navigationRepository,
                                ExperienceWebsiteSeoSettingsRepository seoSettingsRepository,
                                ExperienceEventRepository eventRepository) {
        this.pageRepository = pageRepository;
        this.sectionRepository = sectionRepository;
        this.themeRepository = themeRepository;
        this.navigationRepository = navigationRepository;
        this.seoSettingsRepository = seoSettingsRepository;
        this.eventRepository = eventRepository;
    }

    public PublicWebsiteDashboardResponse dashboard() {
        Instant to = Instant.now();
        Instant from = to.minus(30, ChronoUnit.DAYS);

        long totalVisitors = eventRepository.countDistinctSessions(from, to);
        long pageViews = eventRepository.countByType("PAGE_VIEW", from, to);
        long ctaClicks = eventRepository.countByType("CTA_CLICK", from, to);
        long demoRequests = eventRepository.countByType("DEMO_START", from, to);
        long investorVisits = eventRepository.countByType("INVESTOR_ROOM_VIEW", from, to);
        int publishedPages = pageRepository.findByDeletedFalseAndPublishedTrueOrderByUpdatedAtDesc().size();
        int seoCoverage = seoSettingsRepository.findAll().size();

        double conversionRate = pageViews == 0 ? 0.0 : (demoRequests * 100.0) / pageViews;

        List<Map<String, Object>> topPages = eventRepository.topPages(from, to, 5).stream().map(row -> {
            Map<String, Object> page = new LinkedHashMap<>();
            page.put("path", row[0]);
            page.put("views", row[1]);
            return page;
        }).toList();

        Map<String, Long> engagement = Map.of(
                "pageViews", pageViews,
                "ctaClicks", ctaClicks,
                "demoRequests", demoRequests,
                "investorVisits", investorVisits
        );

        return new PublicWebsiteDashboardResponse(
                totalVisitors,
                pageViews,
                ctaClicks,
                demoRequests,
                investorVisits,
                publishedPages,
                seoCoverage,
                conversionRate,
                topPages,
                engagement
        );
    }

    public List<WebsitePageResponse> publishedPages() {
        return pageRepository.findByDeletedFalseAndPublishedTrueOrderByUpdatedAtDesc().stream().map(WebsitePageResponse::from).toList();
    }

    public Map<String, Object> publicPageBySlug(String slug) {
        var page = pageRepository.findBySlugAndDeletedFalseAndPublishedTrue(slug)
                .orElseThrow(() -> new NotFoundException("Published website page not found"));

        var sections = sectionRepository.findByPageIdAndPublishedTrueOrderByPositionAsc(page.getId())
                .stream().map(WebsiteSectionResponse::from).toList();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("page", WebsitePageResponse.from(page));
        payload.put("sections", sections);
        return payload;
    }

    public List<WebsiteNavigationResponse> publishedNavigation() {
        return navigationRepository.findByPublishedTrueAndVisibleTrueOrderByGroupNameAscPositionAsc().stream()
                .map(WebsiteNavigationResponse::from)
                .toList();
    }

    public WebsiteThemeResponse publishedTheme() {
        return themeRepository.findFirstByPublishedTrueOrderByUpdatedAtDesc()
                .map(WebsiteThemeResponse::from)
                .orElseThrow(() -> new NotFoundException("Published website theme not found"));
    }

    public List<WebsiteSectionResponse> sectionsByPage(String slug) {
        var page = pageRepository.findBySlugAndDeletedFalseAndPublishedTrue(slug)
                .orElseThrow(() -> new NotFoundException("Published website page not found"));
        return sectionRepository.findByPageIdAndPublishedTrueOrderByPositionAsc(page.getId())
                .stream().map(WebsiteSectionResponse::from).toList();
    }
}
