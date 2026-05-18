package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.WebsiteSeoUpsertRequest;
import com.cloudcampus.experience.dto.response.WebsiteSeoSettingsResponse;
import com.cloudcampus.experience.entity.WebsiteSeoSettings;
import com.cloudcampus.experience.repository.ExperienceWebsiteSeoSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class SeoService {

    private final ExperienceWebsiteSeoSettingsRepository seoSettingsRepository;
    private final WebsiteSchemaValidator websiteSchemaValidator;
    private final WebsiteAuditTimelineService auditTimelineService;

    public SeoService(ExperienceWebsiteSeoSettingsRepository seoSettingsRepository,
                      WebsiteSchemaValidator websiteSchemaValidator,
                      WebsiteAuditTimelineService auditTimelineService) {
        this.seoSettingsRepository = seoSettingsRepository;
        this.websiteSchemaValidator = websiteSchemaValidator;
        this.auditTimelineService = auditTimelineService;
    }

    public List<WebsiteSeoSettingsResponse> listAll() {
        return seoSettingsRepository.findAllByOrderByUpdatedAtDesc().stream().map(WebsiteSeoSettingsResponse::from).toList();
    }

    public WebsiteSeoSettingsResponse getByRoute(String routePath, boolean publishedOnly) {
        if (publishedOnly) {
            return seoSettingsRepository.findByRoutePathAndPublishedTrue(routePath)
                    .map(WebsiteSeoSettingsResponse::from)
                    .orElseThrow(() -> new NotFoundException("SEO settings not found"));
        }
        return seoSettingsRepository.findByRoutePath(routePath)
                .map(WebsiteSeoSettingsResponse::from)
                .orElseThrow(() -> new NotFoundException("SEO settings not found"));
    }

    @Transactional
    public WebsiteSeoSettingsResponse upsert(WebsiteSeoUpsertRequest req, java.util.UUID actorId) {
        websiteSchemaValidator.validateSeo(req);
        WebsiteSeoSettings settings = seoSettingsRepository.findByRoutePath(req.routePath())
                .orElseGet(() -> WebsiteSeoSettings.create(
                        req.pageId(),
                        req.routePath(),
                        req.metaTitle(),
                        req.metaDescription(),
                        nullSafeMap(req.openGraphJson()),
                        nullSafeMap(req.twitterJson()),
                        nullSafeMap(req.structuredDataJson()),
                        req.robots(),
                        req.sitemapPriority(),
                        req.sitemapChangeFreq()
                ));

        if (settings.getId() != null) {
            settings.update(
                    req.pageId(),
                    req.routePath(),
                    req.metaTitle(),
                    req.metaDescription(),
                    nullSafeMap(req.openGraphJson()),
                    nullSafeMap(req.twitterJson()),
                    nullSafeMap(req.structuredDataJson()),
                    req.robots(),
                    req.sitemapPriority(),
                    req.sitemapChangeFreq()
            );
        }
        WebsiteSeoSettings saved = seoSettingsRepository.save(settings);
        auditTimelineService.record(
                "SEO_SAVED",
                "SEO",
                saved.getId(),
                saved.getRoutePath(),
                actorId,
                Map.of("routePath", saved.getRoutePath(), "sitemapPriority", saved.getSitemapPriority())
        );
        return WebsiteSeoSettingsResponse.from(saved);
    }

    @Transactional
    public WebsiteSeoSettingsResponse publish(String routePath, java.util.UUID actorId) {
        WebsiteSeoSettings settings = seoSettingsRepository.findByRoutePath(routePath)
                .orElseThrow(() -> new NotFoundException("SEO settings not found"));
        settings.publish();
        WebsiteSeoSettings saved = seoSettingsRepository.save(settings);
        auditTimelineService.record(
                "SEO_PUBLISHED",
                "SEO",
                saved.getId(),
                saved.getRoutePath(),
                actorId,
                Map.of("routePath", saved.getRoutePath())
        );
        return WebsiteSeoSettingsResponse.from(saved);
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Map.of() : input;
    }
}
