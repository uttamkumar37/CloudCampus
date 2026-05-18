package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.response.WebsiteAuditTimelineEventResponse;
import com.cloudcampus.experience.dto.response.WebsitePublishSnapshotResponse;
import com.cloudcampus.experience.dto.response.WebsiteRollbackAuditLogResponse;
import com.cloudcampus.experience.entity.WebsiteNavigation;
import com.cloudcampus.experience.entity.WebsitePage;
import com.cloudcampus.experience.entity.WebsitePublishSnapshot;
import com.cloudcampus.experience.entity.WebsiteRollbackAuditLog;
import com.cloudcampus.experience.entity.WebsiteSection;
import com.cloudcampus.experience.entity.WebsiteSeoSettings;
import com.cloudcampus.experience.entity.WebsiteTheme;
import com.cloudcampus.experience.repository.ExperienceWebsiteNavigationRepository;
import com.cloudcampus.experience.repository.ExperienceWebsitePageRepository;
import com.cloudcampus.experience.repository.ExperienceWebsitePublishSnapshotRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteRollbackAuditLogRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteSectionRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteSeoSettingsRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteThemeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PublishService {

    private final ExperienceWebsitePageRepository pageRepository;
    private final ExperienceWebsiteSectionRepository sectionRepository;
    private final ExperienceWebsiteThemeRepository themeRepository;
    private final ExperienceWebsiteNavigationRepository navigationRepository;
    private final ExperienceWebsiteSeoSettingsRepository seoSettingsRepository;
    private final ExperienceWebsitePublishSnapshotRepository snapshotRepository;
    private final ExperienceWebsiteRollbackAuditLogRepository rollbackAuditLogRepository;
    private final WebsitePublishValidationService publishValidationService;
    private final WebsiteAuditTimelineService auditTimelineService;

    public PublishService(ExperienceWebsitePageRepository pageRepository,
                          ExperienceWebsiteSectionRepository sectionRepository,
                          ExperienceWebsiteThemeRepository themeRepository,
                          ExperienceWebsiteNavigationRepository navigationRepository,
                          ExperienceWebsiteSeoSettingsRepository seoSettingsRepository,
                          ExperienceWebsitePublishSnapshotRepository snapshotRepository,
                          ExperienceWebsiteRollbackAuditLogRepository rollbackAuditLogRepository,
                          WebsitePublishValidationService publishValidationService,
                          WebsiteAuditTimelineService auditTimelineService) {
        this.pageRepository = pageRepository;
        this.sectionRepository = sectionRepository;
        this.themeRepository = themeRepository;
        this.navigationRepository = navigationRepository;
        this.seoSettingsRepository = seoSettingsRepository;
        this.snapshotRepository = snapshotRepository;
        this.rollbackAuditLogRepository = rollbackAuditLogRepository;
        this.publishValidationService = publishValidationService;
        this.auditTimelineService = auditTimelineService;
    }

    @Transactional
    public WebsitePublishSnapshotResponse publishAll(UUID actorId) {
        List<WebsitePage> pages = pageRepository.findByDeletedFalseOrderByUpdatedAtDesc();
        List<WebsiteSection> sections = sectionRepository.findAll();
        List<WebsiteTheme> themes = themeRepository.findAll();
        List<WebsiteNavigation> navigation = navigationRepository.findAll();
        List<WebsiteSeoSettings> seoSettings = seoSettingsRepository.findAll();

        publishValidationService.validateBeforePublish(pages, sections, themes, navigation, seoSettings);

        Map<String, Object> snapshotJson = buildSnapshotJson(pages, sections, themes, navigation, seoSettings);
        String label = "release-" + Instant.now();
        WebsitePublishSnapshot snapshot = snapshotRepository.save(WebsitePublishSnapshot.create(label, snapshotJson, actorId));

        pages.forEach(page -> {
            if (!page.isPublished()) {
                page.publish();
                pageRepository.save(page);
            }
        });

        sections.forEach(section -> {
            if (!section.isPublished()) {
                section.publish();
                sectionRepository.save(section);
            }
        });

        navigation.forEach(item -> {
            if (!item.isPublished()) {
                item.publish();
                navigationRepository.save(item);
            }
        });

        themes.forEach(theme -> {
            if (!theme.isPublished()) {
                theme.publish();
                themeRepository.save(theme);
            }
        });

        seoSettings.forEach(seo -> {
            if (!seo.isPublished()) {
                seo.publish();
                seoSettingsRepository.save(seo);
            }
        });

        auditTimelineService.record(
                "WEBSITE_PUBLISHED",
                "PUBLISH",
                snapshot.getId(),
                snapshot.getVersionLabel(),
                actorId,
                Map.of(
                        "pages", pages.size(),
                        "sections", sections.size(),
                        "themes", themes.size(),
                        "navigation", navigation.size(),
                        "seo", seoSettings.size()
                )
        );
        return WebsitePublishSnapshotResponse.from(snapshot);
    }

    @Transactional
    public WebsitePublishSnapshotResponse rollback(UUID snapshotId, UUID actorId) {
        WebsitePublishSnapshot snapshot = snapshotRepository.findById(snapshotId)
                .orElseThrow(() -> new NotFoundException("Publish snapshot not found"));

        Map<String, Object> json = snapshot.getSnapshotJson();

        Map<String, Object> restoredCounts = new LinkedHashMap<>();
        restoredCounts.put("pagesChanged", restorePagePublishedFlags(pageRepository.findAll(), castMap(json.get("pages"))));
        restoredCounts.put("sectionsChanged", restoreSectionPublishedFlags(sectionRepository.findAll(), castMap(json.get("sections"))));
        restoredCounts.put("themesChanged", restoreThemePublishedFlags(themeRepository.findAll(), castMap(json.get("themes"))));
        restoredCounts.put("navigationChanged", restoreNavigationPublishedFlags(navigationRepository.findAll(), castMap(json.get("navigation"))));
        restoredCounts.put("seoChanged", restoreSeoPublishedFlags(seoSettingsRepository.findAll(), castMap(json.get("seo"))));

        rollbackAuditLogRepository.save(WebsiteRollbackAuditLog.create(
                snapshot.getId(),
                snapshot.getVersionLabel(),
                actorId,
                restoredCounts
        ));
        auditTimelineService.record(
                "WEBSITE_ROLLED_BACK",
                "ROLLBACK",
                snapshot.getId(),
                snapshot.getVersionLabel(),
                actorId,
                restoredCounts
        );

        return WebsitePublishSnapshotResponse.from(snapshot);
    }

    public List<WebsitePublishSnapshotResponse> snapshots() {
        return snapshotRepository.findAllByOrderByCreatedAtDesc().stream().map(WebsitePublishSnapshotResponse::from).toList();
    }

    public List<WebsiteRollbackAuditLogResponse> rollbackAudit(UUID snapshotId) {
        if (snapshotId == null) {
            return rollbackAuditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                    .map(WebsiteRollbackAuditLogResponse::from)
                    .toList();
        }
        return rollbackAuditLogRepository.findBySnapshotIdOrderByCreatedAtDesc(snapshotId).stream()
                .map(WebsiteRollbackAuditLogResponse::from)
                .toList();
    }

    public List<WebsiteAuditTimelineEventResponse> auditTimeline(int limit) {
        return auditTimelineService.list(limit);
    }

    private Map<String, Object> buildSnapshotJson(List<WebsitePage> pages,
                                                  List<WebsiteSection> sections,
                                                  List<WebsiteTheme> themes,
                                                  List<WebsiteNavigation> navigation,
                                                  List<WebsiteSeoSettings> seoSettings) {
        Map<String, Object> result = new HashMap<>();
        result.put("pages", mapPublishedStates(pages));
        result.put("sections", mapPublishedStates(sections));
        result.put("themes", mapPublishedStates(themes));
        result.put("navigation", mapPublishedStates(navigation));
        result.put("seo", mapPublishedStates(seoSettings));
        return result;
    }

    private Map<String, Boolean> mapPublishedStates(List<?> entities) {
        Map<String, Boolean> states = new HashMap<>();
        for (Object entity : entities) {
            if (entity instanceof WebsitePage page) {
                states.put(page.getId().toString(), page.isPublished());
            } else if (entity instanceof WebsiteSection section) {
                states.put(section.getId().toString(), section.isPublished());
            } else if (entity instanceof WebsiteTheme theme) {
                states.put(theme.getId().toString(), theme.isPublished());
            } else if (entity instanceof WebsiteNavigation navigation) {
                states.put(navigation.getId().toString(), navigation.isPublished());
            } else if (entity instanceof WebsiteSeoSettings seo) {
                states.put(seo.getId().toString(), seo.isPublished());
            }
        }
        return states;
    }

    private Map<String, Boolean> castMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            Map<String, Boolean> result = new HashMap<>();
            map.forEach((k, v) -> result.put(String.valueOf(k), Boolean.TRUE.equals(v)));
            return result;
        }
        return Map.of();
    }

    private int restorePagePublishedFlags(List<WebsitePage> pages, Map<String, Boolean> states) {
        int changed = 0;
        for (WebsitePage page : pages) {
            boolean shouldBePublished = states.getOrDefault(page.getId().toString(), false);
            if (page.isPublished() != shouldBePublished) {
                page.restorePublishedState(shouldBePublished);
                pageRepository.save(page);
                changed++;
            }
        }
        return changed;
    }

    private int restoreSectionPublishedFlags(List<WebsiteSection> sections, Map<String, Boolean> states) {
        int changed = 0;
        for (WebsiteSection section : sections) {
            boolean shouldBePublished = states.getOrDefault(section.getId().toString(), false);
            if (section.isPublished() != shouldBePublished) {
                section.restorePublishedState(shouldBePublished);
                sectionRepository.save(section);
                changed++;
            }
        }
        return changed;
    }

    private int restoreThemePublishedFlags(List<WebsiteTheme> themes, Map<String, Boolean> states) {
        int changed = 0;
        for (WebsiteTheme theme : themes) {
            boolean shouldBePublished = states.getOrDefault(theme.getId().toString(), false);
            if (theme.isPublished() != shouldBePublished) {
                theme.restorePublishedState(shouldBePublished);
                themeRepository.save(theme);
                changed++;
            }
        }
        return changed;
    }

    private int restoreNavigationPublishedFlags(List<WebsiteNavigation> navigation, Map<String, Boolean> states) {
        int changed = 0;
        for (WebsiteNavigation item : navigation) {
            boolean shouldBePublished = states.getOrDefault(item.getId().toString(), false);
            if (item.isPublished() != shouldBePublished) {
                item.restorePublishedState(shouldBePublished);
                navigationRepository.save(item);
                changed++;
            }
        }
        return changed;
    }

    private int restoreSeoPublishedFlags(List<WebsiteSeoSettings> seoSettings, Map<String, Boolean> states) {
        int changed = 0;
        for (WebsiteSeoSettings seo : seoSettings) {
            boolean shouldBePublished = states.getOrDefault(seo.getId().toString(), false);
            if (seo.isPublished() != shouldBePublished) {
                seo.restorePublishedState(shouldBePublished);
                seoSettingsRepository.save(seo);
                changed++;
            }
        }
        return changed;
    }
}
