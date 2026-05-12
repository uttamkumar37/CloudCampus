package com.cloudcampus.feature.entity;

/**
 * Classification of a feature in the platform feature catalog.
 *
 * CORE     — Always enabled for every tenant; cannot be toggled off.
 * OPTIONAL — Off by default; tenant can enable/disable without a plan change.
 * PREMIUM  — Requires an active subscription plan; Super Admin enables per tenant.
 * BETA     — Controlled rollout; Super Admin explicitly adds selected tenants.
 */
public enum FeatureType {
    CORE,
    OPTIONAL,
    PREMIUM,
    BETA
}
