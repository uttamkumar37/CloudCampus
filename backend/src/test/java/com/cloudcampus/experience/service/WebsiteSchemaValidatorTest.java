package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.experience.dto.request.WebsiteNavigationCreateRequest;
import com.cloudcampus.experience.dto.request.WebsitePageCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteSectionCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteSeoUpsertRequest;
import com.cloudcampus.experience.dto.request.WebsiteThemeCreateRequest;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class WebsiteSchemaValidatorTest {

    private final WebsiteSchemaValidator validator = new WebsiteSchemaValidator();

    @Test
    void validateCreatePage_whenPayloadIsSchemaSafe_allowsSave() {
        var request = new WebsitePageCreateRequest(
                "home",
                "CloudCampus Home",
                "home",
                Map.of(
                        "title", "CloudCampus",
                        "description", "AI native school ERP",
                        "canonicalUrl", "https://cloudcampus.example/home"
                ),
                Map.of("showcase", List.of("ai", "erp"))
        );

        assertThatCode(() -> validator.validateCreatePage(request)).doesNotThrowAnyException();
    }

    @Test
    void validateCreatePage_whenSlugContainsUnsafeCharacters_rejectsPayload() {
        var request = new WebsitePageCreateRequest(
                "home",
                "CloudCampus Home",
                "../admin",
                Map.of(),
                Map.of()
        );

        assertThatThrownBy(() -> validator.validateCreatePage(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("slug");
    }

    @Test
    void validateCreateSection_whenNestedConfigIsTooDeep_rejectsPayload() {
        Map<String, Object> deepConfig = Map.of(
                "level1", Map.of(
                        "level2", Map.of(
                                "level3", Map.of(
                                        "level4", Map.of(
                                                "level5", Map.of(
                                                        "level6", Map.of(
                                                                "level7", Map.of(
                                                                        "level8", Map.of("level9", "too deep")
                                                                )
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );
        var request = new WebsiteSectionCreateRequest(
                "hero",
                "Hero",
                "HERO",
                0,
                deepConfig
        );

        assertThatThrownBy(() -> validator.validateCreateSection(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("depth");
    }

    @Test
    void validateCreateTheme_whenThemeColorIsInvalid_rejectsPayload() {
        var request = new WebsiteThemeCreateRequest(
                "enterprise-aurora",
                "Enterprise Aurora",
                Map.of("primary", "javascript:alert(1)"),
                Map.of("heading", "Inter"),
                Map.of("motion", "smooth")
        );

        assertThatThrownBy(() -> validator.validateCreateTheme(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("tokensJson.primary");
    }

    @Test
    void validateCreateNavigation_whenTargetIsUnsupported_rejectsPayload() {
        var request = new WebsiteNavigationCreateRequest(
                "Docs",
                "/docs",
                "POPUP",
                "primary",
                1,
                true
        );

        assertThatThrownBy(() -> validator.validateCreateNavigation(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("target");
    }

    @Test
    void validateSeo_whenPayloadIsSchemaSafe_allowsSave() {
        var request = new WebsiteSeoUpsertRequest(
                null,
                "/features",
                "Features | CloudCampus",
                "Explore CloudCampus platform features.",
                Map.of("title", "Features", "url", "https://cloudcampus.example/features"),
                Map.of("card", "summary_large_image"),
                Map.of("@type", "WebPage"),
                "index,follow",
                0.8,
                "weekly"
        );

        assertThatCode(() -> validator.validateSeo(request)).doesNotThrowAnyException();
    }

    @Test
    void validateSeo_whenSitemapPriorityIsOutOfRange_rejectsPayload() {
        var request = new WebsiteSeoUpsertRequest(
                null,
                "/features",
                "Features | CloudCampus",
                "Explore CloudCampus platform features.",
                Map.of(),
                Map.of(),
                Map.of(),
                "index,follow",
                1.5,
                "weekly"
        );

        assertThatThrownBy(() -> validator.validateSeo(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("sitemapPriority");
    }
}
