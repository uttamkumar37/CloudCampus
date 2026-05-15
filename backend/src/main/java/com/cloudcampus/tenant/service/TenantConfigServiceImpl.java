package com.cloudcampus.tenant.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.tenant.dto.TenantConfigResponse;
import com.cloudcampus.tenant.entity.TenantConfig;
import com.cloudcampus.tenant.entity.TenantConfigKey;
import com.cloudcampus.tenant.repository.TenantConfigRepository;
import com.cloudcampus.tenant.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class TenantConfigServiceImpl implements TenantConfigService {

    private static final Pattern EMAIL_RE =
            Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final Pattern LANGUAGE_RE =
            Pattern.compile("^[a-z]{2}$");
    private static final Pattern HEX_COLOR_RE =
            Pattern.compile("^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$");
    private static final Pattern URL_RE =
            Pattern.compile("^https?://[^\\s]{1,2000}$");

    private final TenantConfigRepository configRepository;
    private final TenantRepository       tenantRepository;

    public TenantConfigServiceImpl(TenantConfigRepository configRepository,
                                   TenantRepository tenantRepository) {
        this.configRepository = configRepository;
        this.tenantRepository = tenantRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public TenantConfigResponse getAll(UUID tenantId) {
        assertTenantExists(tenantId);
        return TenantConfigResponse.from(loadMerged(tenantId));
    }

    @Override
    @Transactional
    public TenantConfigResponse set(UUID tenantId, TenantConfigKey key, String value) {
        assertTenantExists(tenantId);
        validate(key, value);

        TenantConfig config = configRepository
                .findByTenantIdAndConfigKey(tenantId, key)
                .orElseGet(() -> new TenantConfig(tenantId, key, value));
        config.setConfigValue(value);
        configRepository.save(config);

        return TenantConfigResponse.from(loadMerged(tenantId));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Map<TenantConfigKey, String> loadMerged(UUID tenantId) {
        List<TenantConfig> rows = configRepository.findAllByTenantId(tenantId);
        Map<TenantConfigKey, String> result = new EnumMap<>(TenantConfigKey.class);
        for (TenantConfig row : rows) {
            result.put(row.getConfigKey(), row.getConfigValue());
        }
        // Fill defaults for keys not yet overridden.
        for (TenantConfigKey key : TenantConfigKey.values()) {
            result.putIfAbsent(key, key.getDefaultValue());
        }
        return result;
    }

    private void assertTenantExists(UUID tenantId) {
        if (!tenantRepository.existsById(tenantId)) {
            throw new NotFoundException("Tenant not found: " + tenantId);
        }
    }

    private void validate(TenantConfigKey key, String value) {
        switch (key) {
            case MAX_SCHOOLS, MAX_STUDENTS_PER_SCHOOL, MAX_STAFF_PER_SCHOOL -> {
                try {
                    int n = Integer.parseInt(value.trim());
                    if (n < 1 || n > 100_000) throw new BadRequestException(
                            key.name() + " must be between 1 and 100000");
                } catch (NumberFormatException e) {
                    throw new BadRequestException(key.name() + " must be a positive integer");
                }
            }
            case SUPPORT_EMAIL -> {
                if (!value.isBlank() && !EMAIL_RE.matcher(value.trim()).matches()) {
                    throw new BadRequestException("SUPPORT_EMAIL must be a valid email address or empty");
                }
            }
            case TIMEZONE -> {
                try {
                    java.time.ZoneId.of(value.trim());
                } catch (java.time.DateTimeException e) {
                    throw new BadRequestException("TIMEZONE must be a valid IANA timezone (e.g. Asia/Kolkata)");
                }
            }
            case DEFAULT_LANGUAGE -> {
                if (!LANGUAGE_RE.matcher(value.trim()).matches()) {
                    throw new BadRequestException("DEFAULT_LANGUAGE must be a 2-letter ISO 639-1 code (e.g. en, hi)");
                }
            }
            case LOGO_URL, FAVICON_URL -> {
                if (!value.isBlank() && !URL_RE.matcher(value.trim()).matches()) {
                    throw new BadRequestException(key.name() + " must be a valid HTTP/HTTPS URL or empty");
                }
            }
            case PRIMARY_COLOR, SECONDARY_COLOR -> {
                if (!HEX_COLOR_RE.matcher(value.trim()).matches()) {
                    throw new BadRequestException(key.name() + " must be a CSS hex colour (e.g. #2563EB or #26B)");
                }
            }
        }
    }
}
