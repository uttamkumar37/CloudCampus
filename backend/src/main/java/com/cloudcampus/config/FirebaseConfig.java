package com.cloudcampus.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

/**
 * Firebase Admin SDK initialisation (CC-1003 / E13).
 *
 * This configuration class is only activated when {@code app.firebase.enabled=true},
 * so the application starts cleanly in dev / test without Firebase credentials.
 *
 * Production usage:
 *  1. Download the service-account JSON from the Firebase console.
 *  2. Mount it as a Kubernetes secret or supply via env var.
 *  3. Set {@code APP_FIREBASE_ENABLED=true} and
 *     {@code APP_FIREBASE_CREDENTIALS_PATH=/path/to/firebase.json}.
 *
 * SECURITY: The service-account file grants broad Firebase project access.
 * Never commit it to source control; always supply it at runtime.
 */
@Configuration
@ConditionalOnProperty(name = "app.firebase.enabled", havingValue = "true")
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    private final FirebaseProperties props;

    public FirebaseConfig(FirebaseProperties props) {
        this.props = props;
    }

    /**
     * Initialises the {@link FirebaseApp} singleton from the service-account JSON.
     * If the app is already initialised (e.g. in tests), returns the existing instance.
     */
    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("FirebaseApp already initialised — reusing existing instance");
            return FirebaseApp.getInstance();
        }

        log.info("Initialising FirebaseApp from credentials: {}", props.getCredentialsPath());

        try (FileInputStream serviceAccount = new FileInputStream(props.getCredentialsPath())) {
            FirebaseOptions.Builder builder = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount));

            if (props.getProjectId() != null && !props.getProjectId().isBlank()) {
                builder.setProjectId(props.getProjectId());
            }

            FirebaseApp app = FirebaseApp.initializeApp(builder.build());
            log.info("FirebaseApp initialised successfully (project={})", app.getOptions().getProjectId());
            return app;
        }
    }

    /**
     * Exposes the {@link FirebaseMessaging} client as a Spring bean.
     *
     * {@code PushServiceImpl} injects this as {@code Optional<FirebaseMessaging>}
     * so it degrades gracefully when Firebase is disabled.
     */
    @Bean
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        return FirebaseMessaging.getInstance(firebaseApp);
    }
}
