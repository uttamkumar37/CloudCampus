package com.cloudcampus.subscription.entity;

/**
 * Subscription plan catalog (CC-0308).
 *
 * Limits are enforced by SubscriptionServiceImpl which writes them to tenant_configs
 * on every plan assignment, where UsageLimitEnforcer reads them at admit/create time.
 *
 * Prices are in paise (INR × 100).
 */
public enum SubscriptionPlanCode {

    FREE(
            "Free",
            0L,
            200,
            20,
            1,
            "For small schools getting started — up to 200 students."
    ),
    STARTER(
            "Starter",
            99900L,     // ₹999/month
            500,
            50,
            1,
            "For growing schools — up to 500 students, 50 staff."
    ),
    PROFESSIONAL(
            "Professional",
            299900L,    // ₹2,999/month
            2000,
            200,
            3,
            "For institutions — up to 2 000 students, 200 staff, 3 schools."
    ),
    ENTERPRISE(
            "Enterprise",
            799900L,    // ₹7,999/month
            10000,
            1000,
            10,
            "For large school networks — up to 10 000 students, 1 000 staff, 10 schools."
    );

    private final String displayName;
    private final long   priceMonthlyPaise;
    private final int    maxStudentsPerSchool;
    private final int    maxStaffPerSchool;
    private final int    maxSchools;
    private final String description;

    SubscriptionPlanCode(String displayName, long priceMonthlyPaise,
                         int maxStudentsPerSchool, int maxStaffPerSchool,
                         int maxSchools, String description) {
        this.displayName          = displayName;
        this.priceMonthlyPaise    = priceMonthlyPaise;
        this.maxStudentsPerSchool = maxStudentsPerSchool;
        this.maxStaffPerSchool    = maxStaffPerSchool;
        this.maxSchools           = maxSchools;
        this.description          = description;
    }

    public String getDisplayName()          { return displayName; }
    public long   getPriceMonthlyPaise()    { return priceMonthlyPaise; }
    public int    getMaxStudentsPerSchool() { return maxStudentsPerSchool; }
    public int    getMaxStaffPerSchool()    { return maxStaffPerSchool; }
    public int    getMaxSchools()           { return maxSchools; }
    public String getDescription()          { return description; }
}
