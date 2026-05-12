package com.cloudcampus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Externalised configuration for Firebase Admin SDK (CC-1003 / E13).
 *
 * Bound from {@code app.firebase.*} in application.yml / environment variables.
 *
 * <pre>
 * app:
 *   firebase:
 *     enabled: true                         # set false to skip Firebase init
 *     credentials-path: /secrets/firebase.json  # path to service-account JSON
 *     project-id: my-firebase-project          # optional — read from JSON if absent
 * </pre>
 *
 * When {@code enabled = false} (default in dev), the {@code FirebaseMessaging}
 * bean is never created; {@code PushServiceImpl} receives an empty Optional and
 * logs each attempt as FAILED with a descriptive message rather than crashing.
 */
@Component
@ConfigurationProperties(prefix = "app.firebase")
public class FirebaseProperties {

    /** Master switch. Set to {@code true} only when credentials-path is also set. */
    private boolean enabled = false;

    /**
     * Absolute path to the Firebase service-account JSON file.
     * In production supply this via a mounted secret or env var
     * {@code APP_FIREBASE_CREDENTIALS_PATH}.
     */
    private String credentialsPath;

    /** Optional explicit project ID. Inferred from the JSON file when absent. */
    private String projectId;

    // ── Getters / Setters ────────────────────────────────────────────────────

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getCredentialsPath() { return credentialsPath; }
    public void setCredentialsPath(String credentialsPath) { this.credentialsPath = credentialsPath; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
}
