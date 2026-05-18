package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.WebsiteThemeCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteThemeUpdateRequest;
import com.cloudcampus.experience.dto.response.WebsiteThemeResponse;
import com.cloudcampus.experience.entity.WebsiteTheme;
import com.cloudcampus.experience.repository.ExperienceWebsiteThemeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class BrandingService {

    private final ExperienceWebsiteThemeRepository themeRepository;
    private final WebsiteSchemaValidator websiteSchemaValidator;
    private final WebsiteAuditTimelineService auditTimelineService;

    public BrandingService(ExperienceWebsiteThemeRepository themeRepository,
                           WebsiteSchemaValidator websiteSchemaValidator,
                           WebsiteAuditTimelineService auditTimelineService) {
        this.themeRepository = themeRepository;
        this.websiteSchemaValidator = websiteSchemaValidator;
        this.auditTimelineService = auditTimelineService;
    }

    public List<WebsiteThemeResponse> listThemes() {
        return themeRepository.findAllByOrderByUpdatedAtDesc().stream().map(WebsiteThemeResponse::from).toList();
    }

    @Transactional
    public WebsiteThemeResponse createTheme(WebsiteThemeCreateRequest req, UUID actorId) {
        websiteSchemaValidator.validateCreateTheme(req);
        WebsiteTheme theme = WebsiteTheme.create(
                req.themeKey(),
                req.name(),
                nullSafeMap(req.tokensJson()),
                nullSafeMap(req.typographyJson()),
                nullSafeMap(req.effectsJson()),
                actorId
        );
        WebsiteTheme saved = themeRepository.save(theme);
        auditTimelineService.record(
                "THEME_CREATED",
                "THEME",
                saved.getId(),
                saved.getName(),
                actorId,
                Map.of("themeKey", saved.getThemeKey())
        );
        return WebsiteThemeResponse.from(saved);
    }

    @Transactional
    public WebsiteThemeResponse updateTheme(UUID id, WebsiteThemeUpdateRequest req, UUID actorId) {
        websiteSchemaValidator.validateUpdateTheme(req);
        WebsiteTheme theme = themeRepository.findById(id).orElseThrow(() -> new NotFoundException("Website theme not found"));
        theme.update(req.name(), nullSafeMap(req.tokensJson()), nullSafeMap(req.typographyJson()), nullSafeMap(req.effectsJson()));
        WebsiteTheme saved = themeRepository.save(theme);
        auditTimelineService.record(
                "THEME_UPDATED",
                "THEME",
                saved.getId(),
                saved.getName(),
                actorId,
                Map.of("themeKey", saved.getThemeKey())
        );
        return WebsiteThemeResponse.from(saved);
    }

    @Transactional
    public WebsiteThemeResponse publishTheme(UUID id, UUID actorId) {
        WebsiteTheme theme = themeRepository.findById(id).orElseThrow(() -> new NotFoundException("Website theme not found"));
        theme.publish();
        WebsiteTheme saved = themeRepository.save(theme);
        auditTimelineService.record(
                "THEME_PUBLISHED",
                "THEME",
                saved.getId(),
                saved.getName(),
                actorId,
                Map.of("themeKey", saved.getThemeKey())
        );
        return WebsiteThemeResponse.from(saved);
    }

    public WebsiteThemeResponse activeTheme() {
        return themeRepository.findFirstByPublishedTrueOrderByUpdatedAtDesc().map(WebsiteThemeResponse::from)
                .orElseThrow(() -> new NotFoundException("No published website theme found"));
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Map.of() : input;
    }
}
