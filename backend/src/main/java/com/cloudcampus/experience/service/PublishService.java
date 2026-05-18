package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.response.WebsitePublishSnapshotResponse;
import com.cloudcampus.experience.entity.WebsiteNavigation;
import com.cloudcampus.experience.entity.WebsitePage;
import com.cloudcampus.experience.entity.WebsitePublishSnapshot;
import com.cloudcampus.experience.entity.WebsiteSection;
import com.cloudcampus.experience.entity.WebsiteSeoSettings;
import com.cloudcampus.experience.entity.WebsiteTheme;
import com.cloudcampus.experience.repository.ExperienceWebsiteNavigationRepository;
import com.cloudcampus.experience.repository.ExperienceWebsitePageRepository;
import com.cloudcampus.experience.repository.ExperienceWebsitePublishSnapshotRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteSectionRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteSeoSettingsRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteThemeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
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

    public PublishService(ExperienceWebsitePageRepository pageRepository,
                          ExperienceWebsiteSectionRepository sectionRepository,
                          ExperienceWebsiteThemeRepository themeRepository,
                          ExperienceWebsiteNavigationRepository navigationRepository,
                          ExperienceWebsiteSeoSettingsRepository seoSettingsRepository,
                          ExperienceWebsitePublishSnapshotRepository snapshotRepository) {
        this.pageRepository = pageRepository;
        this.sectionRepository = sectionRepository;
        this.themeRepository = themeRepository;
        this.navigationRepository = navigationRepository;
        this.seoSettingsRepository = seoSettingsRepository;
        this.snapshotRepository = snapshotRepository;
    }

    @Transactional
    public WebsitePublishSnapshotResponse publishAll(UUID actorId) {
        Map<String, Object> snapshotJson = buildSnapshotJson();
        String label = "release-" + Instant.now();
        WebsitePublishSnapshot snapshot = snapshotRepository.save(WebsitePublishSnapshot.create(label, snapshotJson, actorId));

        pageRepository.findByDeletedFalseOrderByUpdatedAtDesc().forEach(page -> {
            if (!page.isPublished()) {
                page.publish();
                pageRepository.save(page);
            }
        });

        sectionRepository.findAll().forEach(section -> {
            if (!section.isPublished()) {
                section.publish();
                sectionRepository.save(section);
            }
        });

        navigationRepository.findAll().forEach(item -> {
            if (!item.isPublished()) {
                item.publish();
                navigationRepository.save(item);
            }
        });

        themeRepository.findAll().forEach(theme -> {
            if (!theme.isPublished()) {
                theme.publish();
                themeRepository.save(theme);
            }
        });

        seoSettingsRepository.findAll().forEach(seo -> {
            if (!seo.isPublished()) {
                seo.publish();
                seoSettingsRepository.save(seo);
            }
        });

        return WebsitePublishSnapshotResponse.from(snapshot);
    }

    @Transactional
    public WebsitePublishSnapshotResponse rollback(UUID snapshotId) {
        WebsitePublishSnapshot snapshot = snapshotRepository.findById(snapshotId)
                .orElseThrow(() -> new NotFoundException("Publish snapshot not found"));

        Map<String, Object> json = snapshot.getSnapshotJson();

        restorePublishedFlags(pageRepository.findAll(), castMap(json.get("pages")));
        restorePublishedFlags(sectionRepository.findAll(), castMap(json.get("sections")));
        restorePublishedFlags(themeRepository.findAll(), castMap(json.get("themes")));
        restorePublishedFlags(navigationRepository.findAll(), castMap(json.get("navigation")));
        restorePublishedFlags(seoSettingsRepository.findAll(), castMap(json.get("seo")));

        return WebsitePublishSnapshotResponse.from(snapshot);
    }

    public List<WebsitePublishSnapshotResponse> snapshots() {
        return snapshotRepository.findAllByOrderByCreatedAtDesc().stream().map(WebsitePublishSnapshotResponse::from).toList();
    }

    private Map<String, Object> buildSnapshotJson() {
        Map<String, Object> result = new HashMap<>();
        result.put("pages", mapPublishedStates(pageRepository.findAll()));
        result.put("sections", mapPublishedStates(sectionRepository.findAll()));
        result.put("themes", mapPublishedStates(themeRepository.findAll()));
        result.put("navigation", mapPublishedStates(navigationRepository.findAll()));
        result.put("seo", mapPublishedStates(seoSettingsRepository.findAll()));
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

    private void restorePublishedFlags(List<?> entities, Map<String, Boolean> states) {
        for (Object entity : entities) {
            boolean shouldBePublished;
            if (entity instanceof WebsitePage page) {
                shouldBePublished = states.getOrDefault(page.getId().toString(), false);
                if (shouldBePublished && !page.isPublished()) {
                    page.publish();
                    pageRepository.save(page);
                }
            } else if (entity instanceof WebsiteSection section) {
                shouldBePublished = states.getOrDefault(section.getId().toString(), false);
                if (shouldBePublished && !section.isPublished()) {
                    section.publish();
                    sectionRepository.save(section);
                }
            } else if (entity instanceof WebsiteTheme theme) {
                shouldBePublished = states.getOrDefault(theme.getId().toString(), false);
                if (shouldBePublished && !theme.isPublished()) {
                    theme.publish();
                    themeRepository.save(theme);
                }
            } else if (entity instanceof WebsiteNavigation navigation) {
                shouldBePublished = states.getOrDefault(navigation.getId().toString(), false);
                if (shouldBePublished && !navigation.isPublished()) {
                    navigation.publish();
                    navigationRepository.save(navigation);
                }
            } else if (entity instanceof WebsiteSeoSettings seo) {
                shouldBePublished = states.getOrDefault(seo.getId().toString(), false);
                if (shouldBePublished && !seo.isPublished()) {
                    seo.publish();
                    seoSettingsRepository.save(seo);
                }
            }
        }
    }
}
