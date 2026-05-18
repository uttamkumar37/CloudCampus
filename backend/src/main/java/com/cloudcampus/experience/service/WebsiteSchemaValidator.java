package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.experience.dto.request.WebsiteNavigationCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteNavigationUpdateRequest;
import com.cloudcampus.experience.dto.request.WebsitePageCreateRequest;
import com.cloudcampus.experience.dto.request.WebsitePageUpdateRequest;
import com.cloudcampus.experience.dto.request.WebsiteSectionCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteSectionUpdateRequest;
import com.cloudcampus.experience.dto.request.WebsiteSeoUpsertRequest;
import com.cloudcampus.experience.dto.request.WebsiteThemeCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteThemeUpdateRequest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class WebsiteSchemaValidator {

    private static final int MAX_JSON_DEPTH = 8;
    private static final int MAX_JSON_NODES = 500;
    private static final int MAX_JSON_KEY_LENGTH = 120;
    private static final int MAX_JSON_STRING_LENGTH = 5_000;

    private static final Pattern KEY_PATTERN = Pattern.compile("[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}");
    private static final Pattern PAGE_SLUG_PATTERN = Pattern.compile("/|/?[A-Za-z0-9][A-Za-z0-9/_~.-]{0,158}");
    private static final Pattern ROUTE_PATH_PATTERN = Pattern.compile("/[A-Za-z0-9/_~.-]*");
    private static final Pattern URL_PATTERN = Pattern.compile("https?://\\S+");
    private static final Pattern NAVIGATION_PATH_PATTERN = Pattern.compile("(/[A-Za-z0-9/_~.#?&=%+-]*)|(https?://\\S+)|(mailto:[^\\s@]+@[^\\s@]+\\.[^\\s@]+)|(tel:\\+?[0-9()\\-\\s]{5,30})");
    private static final Pattern ROBOTS_PATTERN = Pattern.compile("[A-Za-z0-9,\\-_:;=\\s]{1,120}");
    private static final Pattern CSS_COLOR_PATTERN = Pattern.compile("(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8}))|(rgb(a)?\\([^)]{5,80}\\))|(hsl(a)?\\([^)]{5,80}\\))|(var\\(--[A-Za-z0-9_-]+\\))");

    private static final Set<String> NAVIGATION_TARGETS = Set.of(
            "SAME_TAB", "NEW_TAB", "SELF", "BLANK", "_self", "_blank"
    );
    private static final Set<String> SITEMAP_CHANGE_FREQUENCIES = Set.of(
            "always", "hourly", "daily", "weekly", "monthly", "yearly", "never"
    );

    public void validateCreatePage(WebsitePageCreateRequest req) {
        requireRequest(req);
        requireKey("pageKey", req.pageKey());
        requireText("title", req.title(), 255);
        requirePageSlug(req.slug());
        validateJsonObject("seoJson", req.seoJson());
        validateJsonObject("settingsJson", req.settingsJson());
        validatePageSeo(req.seoJson());
    }

    public void validateUpdatePage(WebsitePageUpdateRequest req) {
        requireRequest(req);
        requireText("title", req.title(), 255);
        requirePageSlug(req.slug());
        validateJsonObject("seoJson", req.seoJson());
        validateJsonObject("settingsJson", req.settingsJson());
        validatePageSeo(req.seoJson());
    }

    public void validateCreateSection(WebsiteSectionCreateRequest req) {
        requireRequest(req);
        requireKey("sectionKey", req.sectionKey());
        requireText("title", req.title(), 255);
        requireToken("sectionType", req.sectionType(), 80);
        requireNonNegative("position", req.position());
        validateJsonObject("configJson", req.configJson());
    }

    public void validateUpdateSection(WebsiteSectionUpdateRequest req) {
        requireRequest(req);
        requireText("title", req.title(), 255);
        requireToken("sectionType", req.sectionType(), 80);
        requireNonNegative("position", req.position());
        validateJsonObject("configJson", req.configJson());
    }

    public void validateCreateTheme(WebsiteThemeCreateRequest req) {
        requireRequest(req);
        requireKey("themeKey", req.themeKey());
        requireText("name", req.name(), 160);
        validateJsonObject("tokensJson", req.tokensJson());
        validateJsonObject("typographyJson", req.typographyJson());
        validateJsonObject("effectsJson", req.effectsJson());
        validateThemeTokens(req.tokensJson());
    }

    public void validateUpdateTheme(WebsiteThemeUpdateRequest req) {
        requireRequest(req);
        requireText("name", req.name(), 160);
        validateJsonObject("tokensJson", req.tokensJson());
        validateJsonObject("typographyJson", req.typographyJson());
        validateJsonObject("effectsJson", req.effectsJson());
        validateThemeTokens(req.tokensJson());
    }

    public void validateCreateNavigation(WebsiteNavigationCreateRequest req) {
        requireRequest(req);
        validateNavigation(req.label(), req.path(), req.target(), req.groupName(), req.position());
    }

    public void validateUpdateNavigation(WebsiteNavigationUpdateRequest req) {
        requireRequest(req);
        validateNavigation(req.label(), req.path(), req.target(), req.groupName(), req.position());
    }

    public void validateSeo(WebsiteSeoUpsertRequest req) {
        requireRequest(req);
        requireRoutePath("routePath", req.routePath());
        requireText("metaTitle", req.metaTitle(), 255);
        requireText("metaDescription", req.metaDescription(), 1_000);
        validateJsonObject("openGraphJson", req.openGraphJson());
        validateJsonObject("twitterJson", req.twitterJson());
        validateJsonObject("structuredDataJson", req.structuredDataJson());
        validateRobots(req.robots());
        validateSitemapPriority(req.sitemapPriority());
        validateSitemapChangeFrequency(req.sitemapChangeFreq());
    }

    private static void validateNavigation(String label, String path, String target, String groupName, int position) {
        requireText("label", label, 120);
        String trimmedPath = requireText("path", path, 255);
        if (!NAVIGATION_PATH_PATTERN.matcher(trimmedPath).matches()) {
            throw new BadRequestException("path must be an internal path, http(s) URL, mailto link, or tel link");
        }
        String trimmedTarget = requireText("target", target, 20);
        if (!NAVIGATION_TARGETS.contains(trimmedTarget)) {
            throw new BadRequestException("target must be one of " + NAVIGATION_TARGETS);
        }
        requireToken("groupName", groupName, 80);
        requireNonNegative("position", position);
    }

    private static void validatePageSeo(Map<String, Object> seoJson) {
        if (seoJson == null || seoJson.isEmpty()) {
            return;
        }
        validateOptionalString(seoJson, "title", 255, "seoJson.title");
        validateOptionalString(seoJson, "description", 1_000, "seoJson.description");
        validateOptionalUrl(seoJson, "canonicalUrl", "seoJson.canonicalUrl");
        validateOptionalUrl(seoJson, "image", "seoJson.image");
    }

    private static void validateThemeTokens(Map<String, Object> tokensJson) {
        if (tokensJson == null || tokensJson.isEmpty()) {
            return;
        }
        for (String key : Set.of("primary", "accent", "surface", "background", "foreground")) {
            Object value = tokensJson.get(key);
            if (value instanceof String color && !CSS_COLOR_PATTERN.matcher(color.trim()).matches()) {
                throw new BadRequestException("tokensJson." + key + " must be a CSS color value");
            }
        }
    }

    private static void validateOptionalString(Map<String, Object> input, String key, int maxLength, String fieldName) {
        Object value = input.get(key);
        if (value == null) {
            return;
        }
        if (!(value instanceof String text) || text.isBlank() || text.length() > maxLength) {
            throw new BadRequestException(fieldName + " must be a non-empty string up to " + maxLength + " characters");
        }
    }

    private static void validateOptionalUrl(Map<String, Object> input, String key, String fieldName) {
        Object value = input.get(key);
        if (value == null) {
            return;
        }
        if (!(value instanceof String text) || !URL_PATTERN.matcher(text.trim()).matches()) {
            throw new BadRequestException(fieldName + " must be an http(s) URL");
        }
    }

    private static void validateRobots(String robots) {
        String trimmed = requireText("robots", robots, 120);
        if (!ROBOTS_PATTERN.matcher(trimmed).matches()) {
            throw new BadRequestException("robots contains unsupported directives");
        }
    }

    private static void validateSitemapPriority(double priority) {
        if (Double.isNaN(priority) || Double.isInfinite(priority) || priority < 0.0 || priority > 1.0) {
            throw new BadRequestException("sitemapPriority must be between 0.0 and 1.0");
        }
    }

    private static void validateSitemapChangeFrequency(String sitemapChangeFreq) {
        String trimmed = requireText("sitemapChangeFreq", sitemapChangeFreq, 40).toLowerCase();
        if (!SITEMAP_CHANGE_FREQUENCIES.contains(trimmed)) {
            throw new BadRequestException("sitemapChangeFreq must be one of " + SITEMAP_CHANGE_FREQUENCIES);
        }
    }

    private static void validateJsonObject(String fieldName, Map<String, Object> value) {
        if (value == null) {
            return;
        }
        validateJsonNode(fieldName, value, 1, new NodeCounter());
    }

    private static void validateJsonNode(String fieldName, Object value, int depth, NodeCounter counter) {
        counter.increment(fieldName);
        if (depth > MAX_JSON_DEPTH) {
            throw new BadRequestException(fieldName + " exceeds maximum JSON depth of " + MAX_JSON_DEPTH);
        }
        if (value == null || value instanceof Boolean || value instanceof Integer || value instanceof Long || value instanceof BigDecimal) {
            return;
        }
        if (value instanceof Float floatValue) {
            validateFiniteNumber(fieldName, floatValue.doubleValue());
            return;
        }
        if (value instanceof Double doubleValue) {
            validateFiniteNumber(fieldName, doubleValue);
            return;
        }
        if (value instanceof String text) {
            if (text.length() > MAX_JSON_STRING_LENGTH) {
                throw new BadRequestException(fieldName + " contains a string longer than " + MAX_JSON_STRING_LENGTH + " characters");
            }
            return;
        }
        if (value instanceof Map<?, ?> map) {
            validateJsonMap(fieldName, map, depth, counter);
            return;
        }
        if (value instanceof Collection<?> collection) {
            for (Object item : collection) {
                validateJsonNode(fieldName, item, depth + 1, counter);
            }
            return;
        }
        throw new BadRequestException(fieldName + " contains unsupported JSON value type");
    }

    private static void validateJsonMap(String fieldName, Map<?, ?> map, int depth, NodeCounter counter) {
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (!(entry.getKey() instanceof String key) || key.isBlank() || key.length() > MAX_JSON_KEY_LENGTH) {
                throw new BadRequestException(fieldName + " contains an invalid JSON key");
            }
            validateJsonNode(fieldName, entry.getValue(), depth + 1, counter);
        }
    }

    private static void validateFiniteNumber(String fieldName, double value) {
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            throw new BadRequestException(fieldName + " contains a non-finite number");
        }
    }

    private static void requireRequest(Object req) {
        if (req == null) {
            throw new BadRequestException("Request body is required");
        }
    }

    private static String requireText(String fieldName, String value, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required");
        }
        String trimmed = value.trim();
        if (trimmed.length() > maxLength) {
            throw new BadRequestException(fieldName + " must be at most " + maxLength + " characters");
        }
        return trimmed;
    }

    private static void requireKey(String fieldName, String value) {
        String trimmed = requireText(fieldName, value, 120);
        if (!KEY_PATTERN.matcher(trimmed).matches()) {
            throw new BadRequestException(fieldName + " must start with a letter or number and contain only letters, numbers, '.', '_', ':', or '-'");
        }
    }

    private static void requireToken(String fieldName, String value, int maxLength) {
        String trimmed = requireText(fieldName, value, maxLength);
        if (!KEY_PATTERN.matcher(trimmed).matches()) {
            throw new BadRequestException(fieldName + " has an invalid format");
        }
    }

    private static void requirePageSlug(String value) {
        String trimmed = requireText("slug", value, 160);
        if (!PAGE_SLUG_PATTERN.matcher(trimmed).matches() || trimmed.contains("//")) {
            throw new BadRequestException("slug must be a route-safe slug");
        }
    }

    private static void requireRoutePath(String fieldName, String value) {
        String trimmed = requireText(fieldName, value, 255);
        if (!ROUTE_PATH_PATTERN.matcher(trimmed).matches() || trimmed.contains("//")) {
            throw new BadRequestException(fieldName + " must start with '/' and contain only route-safe characters");
        }
    }

    private static void requireNonNegative(String fieldName, int value) {
        if (value < 0) {
            throw new BadRequestException(fieldName + " must be zero or greater");
        }
    }

    private static final class NodeCounter {
        private int value;

        private void increment(String fieldName) {
            value++;
            if (value > MAX_JSON_NODES) {
                throw new BadRequestException(fieldName + " exceeds maximum JSON size of " + MAX_JSON_NODES + " nodes");
            }
        }
    }
}
