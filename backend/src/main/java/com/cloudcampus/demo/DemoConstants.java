package com.cloudcampus.demo;

import java.util.UUID;

/**
 * Stable UUID constants for the Jawahar Navodaya Vidyalaya Lucknow demo tenant.
 *
 * All IDs use the hex-safe prefix c000000x-… so they are valid UUIDs and
 * easily recognisable in logs / DB queries.
 *
 * These are intentionally public — DemoModeInterceptor and DemoResetScheduler
 * both need TENANT_ID without taking a full DemoDataSeeder dependency.
 */
public final class DemoConstants {

    private DemoConstants() {}

    // ── Tenant & School ───────────────────────────────────────────────────────
    public static final UUID   TENANT_ID   = UUID.fromString("c0000000-0000-0000-0000-000000000001");
    public static final UUID   SCHOOL_ID   = UUID.fromString("c0000000-0000-0000-0000-000000000002");
    public static final String TENANT_CODE = "jnv-lucknow-demo";
    public static final String SCHOOL_NAME = "Jawahar Navodaya Vidyalaya Lucknow";

    // ── Stable user IDs (used for teacher portal tests + user_school_access) ─
    public static final UUID ADMIN_USER_ID    = UUID.fromString("c0000000-0000-0000-0000-000000000010");
    public static final UUID TEACHER1_USER_ID = UUID.fromString("c0000000-0000-0000-0000-000000000011");
    public static final UUID STUDENT1_USER_ID = UUID.fromString("c0000000-0000-0000-0000-000000000020");
    public static final UUID PARENT1_USER_ID  = UUID.fromString("c0000000-0000-0000-0000-000000000030");

    // ── Academic year ─────────────────────────────────────────────────────────
    public static final UUID AY_ID   = UUID.fromString("c0000000-0000-0000-0000-000000000003");
    public static final String AY_NAME = "2025-26";

    // ── Demo credentials (same for every demo user for easy showcase) ─────────
    public static final String DEMO_PASSWORD = "Demo@1234";

    // ── Misc ──────────────────────────────────────────────────────────────────
    /** Number of students per section (× 42 sections = 1 050 total). */
    public static final int STUDENTS_PER_SECTION = 25;

    /** Sections per class (A / B / C). */
    public static final String[] SECTION_NAMES = {"A", "B", "C"};

    /** Guard: seeding is skipped when this many students already exist. */
    public static final int SEED_GUARD_THRESHOLD = 100;
}
