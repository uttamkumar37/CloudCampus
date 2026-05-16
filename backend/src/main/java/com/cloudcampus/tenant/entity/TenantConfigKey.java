package com.cloudcampus.tenant.entity;

/**
 * Catalogue of all supported per-tenant configuration keys (CC-0207).
 *
 * Each key carries a default value that is returned when the tenant has not
 * explicitly set the config. This keeps the database sparse — only
 * overrides are stored.
 *
 * Validation of typed values (e.g. positive integer, valid email) is done
 * in TenantConfigServiceImpl before persistence.
 */
public enum TenantConfigKey {

    MAX_SCHOOLS(
            "5",
            "Maximum number of schools allowed for this tenant"
    ),
    MAX_STUDENTS_PER_SCHOOL(
            "2000",
            "Maximum number of students per school"
    ),
    MAX_STAFF_PER_SCHOOL(
            "200",
            "Maximum number of staff members per school"
    ),
    SUPPORT_EMAIL(
            "",
            "Tenant support contact email (shown in-app to end users)"
    ),
    TIMEZONE(
            "UTC",
            "Default IANA timezone for the tenant (e.g. Asia/Kolkata, America/New_York)"
    ),
    DEFAULT_LANGUAGE(
            "en",
            "Default UI language code (ISO 639-1, e.g. en, hi, ta)"
    ),

    // ── Branding (CC-0206) ────────────────────────────────────────────────────

    LOGO_URL(
            "",
            "URL of the tenant logo image (HTTPS recommended, max 2 MB, shown in portal sidebar)"
    ),
    FAVICON_URL(
            "",
            "URL of the browser favicon for this tenant's portal (ICO or PNG, 32×32 recommended)"
    ),
    PRIMARY_COLOR(
            "#2563EB",
            "Primary brand colour as a CSS hex value (e.g. #2563EB)"
    ),
    SECONDARY_COLOR(
            "#1e40af",
            "Secondary brand colour as a CSS hex value (e.g. #1e40af)"
    ),

    // ── AI usage limits (CC-1605) ─────────────────────────────────────────────

    AI_MONTHLY_TOKEN_BUDGET(
            "0",
            "Maximum AI tokens (input + output) per calendar month. 0 = unlimited."
    ),
    AI_REQUESTS_PER_DAY(
            "0",
            "Maximum AI API calls per calendar day. 0 = unlimited."
    );

    private final String defaultValue;
    private final String description;

    TenantConfigKey(String defaultValue, String description) {
        this.defaultValue = defaultValue;
        this.description  = description;
    }

    public String getDefaultValue() { return defaultValue; }
    public String getDescription()  { return description; }
}
