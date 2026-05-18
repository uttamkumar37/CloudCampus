package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.experience.entity.WebsiteNavigation;
import com.cloudcampus.experience.entity.WebsitePage;
import com.cloudcampus.experience.entity.WebsiteSection;
import com.cloudcampus.experience.entity.WebsiteSeoSettings;
import com.cloudcampus.experience.entity.WebsiteTheme;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class WebsitePublishValidationServiceTest {

    private final WebsitePublishValidationService validator = new WebsitePublishValidationService();

    @Test
    void validateBeforePublish_whenReleaseStateIsComplete_allowsPublish() {
        WebsitePage page = page("home", "home", Map.of("title", "CloudCampus", "description", "AI native school ERP"));
        WebsiteSection section = section(page.getId());
        WebsiteTheme theme = theme(Map.of("primary", "#0B2A4A", "accent", "#12B5CB", "surface", "#F2F6FA"));
        WebsiteNavigation navigation = navigation("Home", "/", "SAME_TAB", "primary", true);
        WebsiteSeoSettings seo = seo("/home", "Home | CloudCampus", "CloudCampus home page.", 0.8, "weekly");

        assertThatCode(() -> validator.validateBeforePublish(
                List.of(page),
                List.of(section),
                List.of(theme),
                List.of(navigation),
                List.of(seo)
        )).doesNotThrowAnyException();
    }

    @Test
    void validateBeforePublish_whenHomePageIsMissing_reportsActionableError() {
        WebsitePage page = page("features", "features", Map.of("title", "Features", "description", "Feature list"));

        assertThatThrownBy(() -> validator.validateBeforePublish(
                List.of(page),
                List.of(),
                List.of(theme(Map.of("primary", "#111111", "accent", "#222222", "surface", "#ffffff"))),
                List.of(navigation("Home", "/", "SAME_TAB", "primary", true)),
                List.of()
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("home page");
    }

    @Test
    void validateBeforePublish_whenPageSeoIsMissing_reportsPageError() {
        WebsitePage page = page("home", "home", Map.of("title", "CloudCampus"));

        assertThatThrownBy(() -> validator.validateBeforePublish(
                List.of(page),
                List.of(),
                List.of(theme(Map.of("primary", "#111111", "accent", "#222222", "surface", "#ffffff"))),
                List.of(navigation("Home", "/", "SAME_TAB", "primary", true)),
                List.of()
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("seoJson.description");
    }

    @Test
    void validateBeforePublish_whenThemeTokensAreIncomplete_reportsThemeError() {
        WebsitePage page = page("home", "home", Map.of("title", "CloudCampus", "description", "AI native school ERP"));

        assertThatThrownBy(() -> validator.validateBeforePublish(
                List.of(page),
                List.of(),
                List.of(theme(Map.of("primary", "#111111"))),
                List.of(navigation("Home", "/", "SAME_TAB", "primary", true)),
                List.of()
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("primary, accent, and surface");
    }

    @Test
    void validateBeforePublish_whenVisibleHomeNavigationIsMissing_reportsNavigationError() {
        WebsitePage page = page("home", "home", Map.of("title", "CloudCampus", "description", "AI native school ERP"));

        assertThatThrownBy(() -> validator.validateBeforePublish(
                List.of(page),
                List.of(),
                List.of(theme(Map.of("primary", "#111111", "accent", "#222222", "surface", "#ffffff"))),
                List.of(navigation("Features", "/features", "SAME_TAB", "primary", true)),
                List.of()
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("visible navigation item for '/'");
    }

    @Test
    void validateBeforePublish_whenSectionReferencesMissingPage_reportsSectionError() {
        WebsitePage page = page("home", "home", Map.of("title", "CloudCampus", "description", "AI native school ERP"));

        assertThatThrownBy(() -> validator.validateBeforePublish(
                List.of(page),
                List.of(section(UUID.randomUUID())),
                List.of(theme(Map.of("primary", "#111111", "accent", "#222222", "surface", "#ffffff"))),
                List.of(navigation("Home", "/", "SAME_TAB", "primary", true)),
                List.of()
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("missing page");
    }

    @Test
    void validateBeforePublish_whenSeoRouteIsInvalid_reportsSeoError() {
        WebsitePage page = page("home", "home", Map.of("title", "CloudCampus", "description", "AI native school ERP"));

        assertThatThrownBy(() -> validator.validateBeforePublish(
                List.of(page),
                List.of(),
                List.of(theme(Map.of("primary", "#111111", "accent", "#222222", "surface", "#ffffff"))),
                List.of(navigation("Home", "/", "SAME_TAB", "primary", true)),
                List.of(seo("features", "Features", "Feature list", 0.5, "weekly"))
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("invalid route path");
    }

    static WebsitePage page(String pageKey, String slug, Map<String, Object> seoJson) {
        WebsitePage page = WebsitePage.create(pageKey, "Page " + pageKey, slug, seoJson, Map.of(), UUID.randomUUID());
        ReflectionTestUtils.setField(page, "id", UUID.randomUUID());
        return page;
    }

    static WebsiteSection section(UUID pageId) {
        WebsiteSection section = WebsiteSection.create(
                pageId,
                "hero",
                "Hero",
                "HERO",
                0,
                Map.of("headline", "CloudCampus"),
                UUID.randomUUID()
        );
        ReflectionTestUtils.setField(section, "id", UUID.randomUUID());
        return section;
    }

    static WebsiteTheme theme(Map<String, Object> tokensJson) {
        WebsiteTheme theme = WebsiteTheme.create(
                "enterprise-aurora",
                "Enterprise Aurora",
                tokensJson,
                Map.of("heading", "Inter"),
                Map.of("motion", "smooth"),
                UUID.randomUUID()
        );
        ReflectionTestUtils.setField(theme, "id", UUID.randomUUID());
        return theme;
    }

    static WebsiteNavigation navigation(String label, String path, String target, String groupName, boolean visible) {
        WebsiteNavigation navigation = WebsiteNavigation.create(
                label,
                path,
                target,
                groupName,
                0,
                visible,
                UUID.randomUUID()
        );
        ReflectionTestUtils.setField(navigation, "id", UUID.randomUUID());
        return navigation;
    }

    static WebsiteSeoSettings seo(String routePath,
                                  String metaTitle,
                                  String metaDescription,
                                  double sitemapPriority,
                                  String sitemapChangeFreq) {
        WebsiteSeoSettings seo = WebsiteSeoSettings.create(
                null,
                routePath,
                metaTitle,
                metaDescription,
                Map.of(),
                Map.of(),
                Map.of(),
                "index,follow",
                sitemapPriority,
                sitemapChangeFreq
        );
        ReflectionTestUtils.setField(seo, "id", UUID.randomUUID());
        return seo;
    }
}
