package com.cloudcampus.feature.service;

import java.util.List;
import java.util.Map;

/**
 * Static feature dependency graph.
 *
 * Each entry declares which other features must be enabled before the key feature
 * can be enabled. The graph is intentionally code-first: features are a finite,
 * known set so a DB table would add indirection with no benefit.
 *
 * Rules enforced by {@link FeatureFlagServiceImpl}:
 *   enable(F)  → auto-enables every feature in getRequired(F) that isn't CORE
 *   disable(F) → blocked if any enabled feature has F in its required set
 */
public final class FeatureDependencies {

    private FeatureDependencies() {}

    private static final Map<String, List<String>> REQUIRES = Map.of(
            "ATTENDANCE_QR",  List.of("ATTENDANCE_MANUAL"),
            "ATTENDANCE_GPS", List.of("ATTENDANCE_MANUAL"),
            "AI_COPILOT",     List.of("ANALYTICS_ADVANCED")
    );

    /** Features that {@code featureKey} requires (may be empty). */
    public static List<String> getRequired(String featureKey) {
        return REQUIRES.getOrDefault(featureKey, List.of());
    }

    /**
     * Features that declare {@code featureKey} as a dependency —
     * i.e. features that would break if {@code featureKey} were disabled.
     */
    public static List<String> getDependents(String featureKey) {
        return REQUIRES.entrySet().stream()
                .filter(e -> e.getValue().contains(featureKey))
                .map(Map.Entry::getKey)
                .toList();
    }
}
