package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.experience.dto.request.WebsitePageCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteSeoUpsertRequest;
import com.cloudcampus.experience.dto.request.WebsiteThemeCreateRequest;
import com.cloudcampus.experience.repository.ExperienceWebsiteNavigationRepository;
import com.cloudcampus.experience.repository.ExperienceWebsitePageRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteSectionRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteSeoSettingsRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteThemeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class WebsiteBuilderSchemaValidationServiceTest {

    private final WebsiteSchemaValidator validator = new WebsiteSchemaValidator();

    @Mock ExperienceWebsitePageRepository pageRepository;
    @Mock ExperienceWebsiteSectionRepository sectionRepository;
    @Mock ExperienceWebsiteNavigationRepository navigationRepository;
    @Mock ExperienceWebsiteThemeRepository themeRepository;
    @Mock ExperienceWebsiteSeoSettingsRepository seoSettingsRepository;
    @Mock WebsiteAuditTimelineService auditTimelineService;

    @Test
    void createPage_whenSchemaInvalid_rejectsBeforeRepositorySave() {
        var service = new PageBuilderService(pageRepository, sectionRepository, navigationRepository, validator, auditTimelineService);
        var request = new WebsitePageCreateRequest(
                "home",
                "CloudCampus Home",
                "home with spaces",
                Map.of(),
                Map.of()
        );

        assertThatThrownBy(() -> service.createPage(request, UUID.randomUUID()))
                .isInstanceOf(BadRequestException.class);

        verifyNoInteractions(pageRepository, sectionRepository, navigationRepository, auditTimelineService);
    }

    @Test
    void createTheme_whenSchemaInvalid_rejectsBeforeRepositorySave() {
        var service = new BrandingService(themeRepository, validator, auditTimelineService);
        var request = new WebsiteThemeCreateRequest(
                "enterprise-aurora",
                "Enterprise Aurora",
                Map.of("primary", "not-a-color"),
                Map.of(),
                Map.of()
        );

        assertThatThrownBy(() -> service.createTheme(request, UUID.randomUUID()))
                .isInstanceOf(BadRequestException.class);

        verifyNoInteractions(themeRepository, auditTimelineService);
    }

    @Test
    void upsertSeo_whenSchemaInvalid_rejectsBeforeRepositoryLookupOrSave() {
        var service = new SeoService(seoSettingsRepository, validator, auditTimelineService);
        var request = new WebsiteSeoUpsertRequest(
                null,
                "features",
                "Features | CloudCampus",
                "Explore CloudCampus platform features.",
                Map.of(),
                Map.of(),
                Map.of(),
                "index,follow",
                0.5,
                "weekly"
        );

        assertThatThrownBy(() -> service.upsert(request, UUID.randomUUID()))
                .isInstanceOf(BadRequestException.class);

        verifyNoInteractions(seoSettingsRepository, auditTimelineService);
    }
}
