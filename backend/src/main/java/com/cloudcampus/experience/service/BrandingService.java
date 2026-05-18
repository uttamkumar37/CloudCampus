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

    public BrandingService(ExperienceWebsiteThemeRepository themeRepository) {
        this.themeRepository = themeRepository;
    }

    public List<WebsiteThemeResponse> listThemes() {
        return themeRepository.findAllByOrderByUpdatedAtDesc().stream().map(WebsiteThemeResponse::from).toList();
    }

    @Transactional
    public WebsiteThemeResponse createTheme(WebsiteThemeCreateRequest req, UUID actorId) {
        WebsiteTheme theme = WebsiteTheme.create(
                req.themeKey(),
                req.name(),
                nullSafeMap(req.tokensJson()),
                nullSafeMap(req.typographyJson()),
                nullSafeMap(req.effectsJson()),
                actorId
        );
        return WebsiteThemeResponse.from(themeRepository.save(theme));
    }

    @Transactional
    public WebsiteThemeResponse updateTheme(UUID id, WebsiteThemeUpdateRequest req) {
        WebsiteTheme theme = themeRepository.findById(id).orElseThrow(() -> new NotFoundException("Website theme not found"));
        theme.update(req.name(), nullSafeMap(req.tokensJson()), nullSafeMap(req.typographyJson()), nullSafeMap(req.effectsJson()));
        return WebsiteThemeResponse.from(themeRepository.save(theme));
    }

    @Transactional
    public WebsiteThemeResponse publishTheme(UUID id) {
        WebsiteTheme theme = themeRepository.findById(id).orElseThrow(() -> new NotFoundException("Website theme not found"));
        theme.publish();
        return WebsiteThemeResponse.from(themeRepository.save(theme));
    }

    public WebsiteThemeResponse activeTheme() {
        return themeRepository.findFirstByPublishedTrueOrderByUpdatedAtDesc().map(WebsiteThemeResponse::from)
                .orElseThrow(() -> new NotFoundException("No published website theme found"));
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Map.of() : input;
    }
}
