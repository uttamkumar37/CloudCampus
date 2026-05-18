package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.experience.entity.WebsiteNavigation;
import com.cloudcampus.experience.entity.WebsitePage;
import com.cloudcampus.experience.entity.WebsiteSection;
import com.cloudcampus.experience.entity.WebsiteSeoSettings;
import com.cloudcampus.experience.entity.WebsiteTheme;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
public class WebsitePublishValidationService {

    private static final Pattern PAGE_SLUG_PATTERN = Pattern.compile("/|/?[A-Za-z0-9][A-Za-z0-9/_~.-]{0,158}");
    private static final Pattern ROUTE_PATH_PATTERN = Pattern.compile("/[A-Za-z0-9/_~.-]*");
    private static final Pattern NAVIGATION_PATH_PATTERN = Pattern.compile("(/[A-Za-z0-9/_~.#?&=%+-]*)|(https?://\\S+)|(mailto:[^\\s@]+@[^\\s@]+\\.[^\\s@]+)|(tel:\\+?[0-9()\\-\\s]{5,30})");
    private static final Set<String> NAVIGATION_TARGETS = Set.of("SAME_TAB", "NEW_TAB", "SELF", "BLANK", "_self", "_blank");
    private static final Set<String> CHANGE_FREQUENCIES = Set.of("always", "hourly", "daily", "weekly", "monthly", "yearly", "never");

    public void validateBeforePublish(List<WebsitePage> pages,
                                      List<WebsiteSection> sections,
                                      List<WebsiteTheme> themes,
                                      List<WebsiteNavigation> navigation,
                                      List<WebsiteSeoSettings> seoSettings) {
        List<String> errors = new ArrayList<>();
        validatePages(pages, errors);
        validateSections(sections, pages, errors);
        validateThemes(themes, errors);
        validateNavigation(navigation, errors);
        validateSeoSettings(seoSettings, errors);

        if (!errors.isEmpty()) {
            throw new BadRequestException("Publish validation failed: " + String.join("; ", errors));
        }
    }

    private static void validatePages(List<WebsitePage> pages, List<String> errors) {
        if (pages == null || pages.isEmpty()) {
            errors.add("at least one page is required");
            return;
        }

        boolean hasHome = false;
        Set<String> slugs = new HashSet<>();
        for (WebsitePage page : pages) {
            String label = pageLabel(page);
            if (isBlank(page.getPageKey())) {
                errors.add(label + " is missing a page key");
            }
            if (isBlank(page.getTitle())) {
                errors.add(label + " is missing a title");
            }
            if (isBlank(page.getSlug()) || !isRouteSafeSlug(page.getSlug())) {
                errors.add(label + " has an invalid slug");
            } else {
                String normalized = normalizePageSlug(page.getSlug());
                if (!slugs.add(normalized)) {
                    errors.add("duplicate page slug '" + page.getSlug() + "'");
                }
                if ("home".equals(normalized) || "/".equals(normalized)) {
                    hasHome = true;
                }
            }
            validatePageSeo(page, label, errors);
        }

        if (!hasHome) {
            errors.add("a home page with slug 'home' or '/' is required");
        }
    }

    private static void validatePageSeo(WebsitePage page, String label, List<String> errors) {
        Map<String, Object> seo = page.getSeoJson();
        if (seo == null || seo.isEmpty()) {
            errors.add(label + " is missing page SEO metadata");
            return;
        }
        if (isBlankString(seo.get("title"))) {
            errors.add(label + " is missing seoJson.title");
        }
        if (isBlankString(seo.get("description"))) {
            errors.add(label + " is missing seoJson.description");
        }
    }

    private static void validateSections(List<WebsiteSection> sections, List<WebsitePage> pages, List<String> errors) {
        Set<UUID> pageIds = new HashSet<>();
        if (pages != null) {
            pages.stream().map(WebsitePage::getId).forEach(pageIds::add);
        }

        for (WebsiteSection section : nullSafe(sections)) {
            String label = "Section '" + safe(section.getSectionKey()) + "'";
            if (section.getPageId() == null || !pageIds.contains(section.getPageId())) {
                errors.add(label + " points to a missing page");
            }
            if (isBlank(section.getSectionKey())) {
                errors.add(label + " is missing a section key");
            }
            if (isBlank(section.getTitle())) {
                errors.add(label + " is missing a title");
            }
            if (isBlank(section.getSectionType())) {
                errors.add(label + " is missing a section type");
            }
            if (section.getPosition() < 0) {
                errors.add(label + " has a negative position");
            }
            if (section.getConfigJson() == null) {
                errors.add(label + " is missing config JSON");
            }
        }
    }

    private static void validateThemes(List<WebsiteTheme> themes, List<String> errors) {
        if (themes == null || themes.isEmpty()) {
            errors.add("at least one website theme is required");
            return;
        }

        boolean hasPublishableTheme = false;
        for (WebsiteTheme theme : themes) {
            String label = "Theme '" + safe(theme.getThemeKey()) + "'";
            if (isBlank(theme.getThemeKey())) {
                errors.add(label + " is missing a theme key");
            }
            if (isBlank(theme.getName())) {
                errors.add(label + " is missing a name");
            }
            Map<String, Object> tokens = theme.getTokensJson();
            Map<String, Object> typography = theme.getTypographyJson();
            if (tokens == null || tokens.isEmpty()) {
                errors.add(label + " is missing theme tokens");
            }
            if (typography == null || typography.isEmpty()) {
                errors.add(label + " is missing typography tokens");
            }
            if (hasText(tokens, "primary") && hasText(tokens, "accent") && hasText(tokens, "surface")) {
                hasPublishableTheme = true;
            }
        }

        if (!hasPublishableTheme) {
            errors.add("a publishable theme must define primary, accent, and surface tokens");
        }
    }

    private static void validateNavigation(List<WebsiteNavigation> navigation, List<String> errors) {
        if (navigation == null || navigation.isEmpty()) {
            errors.add("at least one navigation item is required");
            return;
        }

        boolean hasVisibleItem = false;
        boolean hasHomeLink = false;
        Set<String> visiblePathGroups = new HashSet<>();
        for (WebsiteNavigation item : navigation) {
            String label = "Navigation item '" + safe(item.getLabel()) + "'";
            if (item.isVisible()) {
                hasVisibleItem = true;
            }
            if (isBlank(item.getLabel())) {
                errors.add(label + " is missing a label");
            }
            if (isBlank(item.getPath()) || !NAVIGATION_PATH_PATTERN.matcher(item.getPath().trim()).matches()) {
                errors.add(label + " has an invalid path");
            }
            if (!isBlank(item.getPath()) && "/".equals(item.getPath().trim()) && item.isVisible()) {
                hasHomeLink = true;
            }
            if (isBlank(item.getTarget()) || !NAVIGATION_TARGETS.contains(item.getTarget().trim())) {
                errors.add(label + " has an invalid target");
            }
            if (isBlank(item.getGroupName())) {
                errors.add(label + " is missing a group name");
            }
            if (item.getPosition() < 0) {
                errors.add(label + " has a negative position");
            }
            if (item.isVisible() && !isBlank(item.getPath()) && !isBlank(item.getGroupName())) {
                String key = item.getGroupName().trim() + "::" + item.getPath().trim();
                if (!visiblePathGroups.add(key)) {
                    errors.add("duplicate visible navigation path '" + item.getPath() + "' in group '" + item.getGroupName() + "'");
                }
            }
        }

        if (!hasVisibleItem) {
            errors.add("at least one visible navigation item is required");
        }
        if (!hasHomeLink) {
            errors.add("a visible navigation item for '/' is required");
        }
    }

    private static void validateSeoSettings(List<WebsiteSeoSettings> seoSettings, List<String> errors) {
        for (WebsiteSeoSettings seo : nullSafe(seoSettings)) {
            String label = "SEO route '" + safe(seo.getRoutePath()) + "'";
            if (isBlank(seo.getRoutePath()) || !ROUTE_PATH_PATTERN.matcher(seo.getRoutePath().trim()).matches()) {
                errors.add(label + " has an invalid route path");
            }
            if (isBlank(seo.getMetaTitle())) {
                errors.add(label + " is missing a meta title");
            }
            if (isBlank(seo.getMetaDescription())) {
                errors.add(label + " is missing a meta description");
            }
            if (seo.getSitemapPriority() < 0.0 || seo.getSitemapPriority() > 1.0) {
                errors.add(label + " has a sitemap priority outside 0.0-1.0");
            }
            if (isBlank(seo.getSitemapChangeFreq()) || !CHANGE_FREQUENCIES.contains(seo.getSitemapChangeFreq().trim().toLowerCase())) {
                errors.add(label + " has an invalid sitemap change frequency");
            }
        }
    }

    private static boolean isRouteSafeSlug(String slug) {
        String trimmed = slug.trim();
        return PAGE_SLUG_PATTERN.matcher(trimmed).matches() && !trimmed.contains("//") && !trimmed.contains("..");
    }

    private static String normalizePageSlug(String slug) {
        String trimmed = slug.trim();
        if (trimmed.startsWith("/") && trimmed.length() > 1) {
            return trimmed.substring(1);
        }
        return trimmed;
    }

    private static boolean hasText(Map<String, Object> input, String key) {
        return input != null && input.get(key) instanceof String value && !value.isBlank();
    }

    private static boolean isBlankString(Object value) {
        return !(value instanceof String text) || text.isBlank();
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String pageLabel(WebsitePage page) {
        return "Page '" + safe(page.getPageKey()) + "'";
    }

    private static String safe(String value) {
        return value == null || value.isBlank() ? "<unknown>" : value;
    }

    private static <T> List<T> nullSafe(List<T> input) {
        return input == null ? List.of() : input;
    }
}
