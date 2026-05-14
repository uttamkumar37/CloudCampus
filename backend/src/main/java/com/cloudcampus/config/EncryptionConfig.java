package com.cloudcampus.config;

import com.cloudcampus.common.crypto.EncryptedStringConverter;
import com.cloudcampus.common.crypto.EncryptionProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

/**
 * Initialises the AES-256-GCM key used by {@link EncryptedStringConverter}
 * before Hibernate loads any entity (CC-1803).
 *
 * The converter is a plain JPA converter (not a Spring bean), so the key must
 * be pushed in via a static initialiser. This @PostConstruct runs early in the
 * application context lifecycle — before JPA/Hibernate processes entities.
 */
@Configuration
public class EncryptionConfig {

    private final EncryptionProperties properties;

    EncryptionConfig(EncryptionProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() {
        EncryptedStringConverter.initialize(properties.secret());
    }
}
