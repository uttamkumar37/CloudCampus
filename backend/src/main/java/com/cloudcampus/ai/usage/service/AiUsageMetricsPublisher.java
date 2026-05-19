package com.cloudcampus.ai.usage.service;

import com.cloudcampus.ai.usage.repository.AiUsageLogRepository;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.entity.TenantConfigKey;
import com.cloudcampus.tenant.entity.TenantStatus;
import com.cloudcampus.tenant.repository.TenantConfigRepository;
import com.cloudcampus.tenant.repository.TenantRepository;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.MultiGauge;
import io.micrometer.core.instrument.Tags;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Publishes AI usage health gauges for Prometheus alerting.
 *
 * Prometheus names:
 * - cloudcampus_ai_budget_utilization_percent
 * - cloudcampus_ai_monthly_tokens_total
 * - cloudcampus_ai_request_failure_rate_percent
 */
@Component
public class AiUsageMetricsPublisher {

    private final TenantRepository       tenantRepo;
    private final TenantConfigRepository configRepo;
    private final AiUsageLogRepository   usageRepo;
    private final MultiGauge             budgetUtilisation;
    private final MultiGauge             monthlyTokens;
    private final MultiGauge             failureRate;

    public AiUsageMetricsPublisher(TenantRepository tenantRepo,
                                   TenantConfigRepository configRepo,
                                   AiUsageLogRepository usageRepo,
                                   MeterRegistry registry) {
        this.tenantRepo  = tenantRepo;
        this.configRepo  = configRepo;
        this.usageRepo   = usageRepo;
        this.budgetUtilisation = MultiGauge.builder("cloudcampus.ai.budget.utilization")
                .description("AI monthly token budget utilisation percentage by tenant")
                .baseUnit("percent")
                .register(registry);
        this.monthlyTokens = MultiGauge.builder("cloudcampus.ai.monthly.tokens")
                .description("AI tokens used by tenant in the current UTC calendar month")
                .baseUnit("tokens")
                .register(registry);
        this.failureRate = MultiGauge.builder("cloudcampus.ai.request.failure.rate")
                .description("AI request failure rate percentage by tenant in the current UTC calendar month")
                .baseUnit("percent")
                .register(registry);
    }

    @PostConstruct
    void publishInitialMetrics() {
        refresh();
    }

    @Scheduled(fixedDelayString = "${app.ai.usage-metrics-refresh-ms:60000}")
    void refresh() {
        Instant monthStart = monthStartUtc();
        List<Tenant> tenants = tenantRepo.findAll().stream()
                .filter(t -> t.getStatus() == TenantStatus.ACTIVE)
                .toList();

        List<MultiGauge.Row<?>> budgetRows = new ArrayList<>();
        List<MultiGauge.Row<?>> tokenRows = new ArrayList<>();
        List<MultiGauge.Row<?>> failureRows = new ArrayList<>();

        for (Tenant tenant : tenants) {
            long tokens = usageRepo.sumTokensByTenantSince(tenant.getId(), monthStart);
            long requests = usageRepo.countRequestsByTenantSince(tenant.getId(), monthStart);
            long failures = usageRepo.countFailedRequestsByTenantSince(tenant.getId(), monthStart);
            long budget = longConfig(tenant, TenantConfigKey.AI_MONTHLY_TOKEN_BUDGET);

            Tags tags = Tags.of(
                    "tenant_id", tenant.getId().toString(),
                    "tenant_code", tenant.getCode());
            tokenRows.add(MultiGauge.Row.of(tags, tokens));
            budgetRows.add(MultiGauge.Row.of(tags, budget > 0 ? percentage(tokens, budget) : 0d));
            failureRows.add(MultiGauge.Row.of(tags, percentage(failures, requests)));
        }

        budgetUtilisation.register(budgetRows, true);
        monthlyTokens.register(tokenRows, true);
        failureRate.register(failureRows, true);
    }

    private long longConfig(Tenant tenant, TenantConfigKey key) {
        String raw = configRepo.findByTenantIdAndConfigKey(tenant.getId(), key)
                .map(c -> c.getConfigValue())
                .orElse(key.getDefaultValue());
        try {
            return Long.parseLong(raw.trim());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    private static double percentage(long part, long total) {
        return total > 0 ? Math.min(100d, part * 100d / total) : 0d;
    }

    private static Instant monthStartUtc() {
        return ZonedDateTime.now(ZoneOffset.UTC)
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0)
                .toInstant();
    }
}
