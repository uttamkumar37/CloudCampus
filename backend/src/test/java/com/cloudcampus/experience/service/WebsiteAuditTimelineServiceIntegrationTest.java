package com.cloudcampus.experience.service;

import com.cloudcampus.experience.dto.request.WebsitePageCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteThemeCreateRequest;
import com.cloudcampus.experience.entity.WebsitePage;
import com.cloudcampus.experience.entity.WebsiteTheme;
import com.cloudcampus.experience.repository.ExperienceWebsiteNavigationRepository;
import com.cloudcampus.experience.repository.ExperienceWebsitePageRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteSectionRepository;
import com.cloudcampus.experience.repository.ExperienceWebsiteThemeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WebsiteAuditTimelineServiceIntegrationTest {

    @Mock ExperienceWebsitePageRepository pageRepository;
    @Mock ExperienceWebsiteSectionRepository sectionRepository;
    @Mock ExperienceWebsiteNavigationRepository navigationRepository;
    @Mock ExperienceWebsiteThemeRepository themeRepository;
    @Mock WebsiteAuditTimelineService auditTimelineService;

    private final WebsiteSchemaValidator validator = new WebsiteSchemaValidator();

    @Test
    void createPage_recordsBuilderAuditTimelineEvent() {
        UUID actorId = UUID.randomUUID();
        PageBuilderService service = new PageBuilderService(
                pageRepository,
                sectionRepository,
                navigationRepository,
                validator,
                auditTimelineService
        );
        when(pageRepository.save(any(WebsitePage.class))).thenAnswer(invocation -> {
            WebsitePage page = invocation.getArgument(0);
            ReflectionTestUtils.setField(page, "id", UUID.randomUUID());
            return page;
        });

        service.createPage(new WebsitePageCreateRequest(
                "home",
                "CloudCampus Home",
                "home",
                Map.of("title", "CloudCampus", "description", "AI native school ERP"),
                Map.of()
        ), actorId);

        verify(auditTimelineService).record(
                eq("PAGE_CREATED"),
                eq("PAGE"),
                any(UUID.class),
                eq("CloudCampus Home"),
                eq(actorId),
                any()
        );
    }

    @Test
    void createTheme_recordsThemeAuditTimelineEvent() {
        UUID actorId = UUID.randomUUID();
        BrandingService service = new BrandingService(themeRepository, validator, auditTimelineService);
        when(themeRepository.save(any(WebsiteTheme.class))).thenAnswer(invocation -> {
            WebsiteTheme theme = invocation.getArgument(0);
            ReflectionTestUtils.setField(theme, "id", UUID.randomUUID());
            return theme;
        });

        service.createTheme(new WebsiteThemeCreateRequest(
                "enterprise-aurora",
                "Enterprise Aurora",
                Map.of("primary", "#0B2A4A", "accent", "#12B5CB", "surface", "#F2F6FA"),
                Map.of("heading", "Inter"),
                Map.of("motion", "smooth")
        ), actorId);

        verify(auditTimelineService).record(
                eq("THEME_CREATED"),
                eq("THEME"),
                any(UUID.class),
                eq("Enterprise Aurora"),
                eq(actorId),
                any()
        );
    }
}
