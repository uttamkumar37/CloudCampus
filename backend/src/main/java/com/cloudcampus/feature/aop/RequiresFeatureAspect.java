package com.cloudcampus.feature.aop;

import com.cloudcampus.common.exception.FeatureNotEnabledException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.feature.annotation.RequiresFeature;
import com.cloudcampus.feature.service.FeatureFlagService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * AOP interceptor for {@link RequiresFeature}-annotated controller methods.
 *
 * Execution order:
 * 1. Resolve current tenantId from {@link RequestContext}.
 * 2. Super Admin (tenantId == null) → skip check, proceed.
 * 3. Call {@link FeatureFlagService#isEnabled(String, String)}.
 * 4. Feature enabled → proceed; disabled → throw {@link FeatureNotEnabledException}.
 *
 * The aspect uses {@code @Around} so it can inspect and optionally short-circuit
 * the invocation before the method body executes.
 */
@Aspect
@Component
public class RequiresFeatureAspect {

    private static final Logger log = LoggerFactory.getLogger(RequiresFeatureAspect.class);

    private final FeatureFlagService featureFlagService;

    public RequiresFeatureAspect(FeatureFlagService featureFlagService) {
        this.featureFlagService = featureFlagService;
    }

    @Around("@annotation(requiresFeature)")
    public Object checkFeature(ProceedingJoinPoint pjp, RequiresFeature requiresFeature) throws Throwable {
        String featureKey = requiresFeature.value();
        String tenantId   = RequestContext.getTenantId();

        // Super Admin has no tenantId — all features available platform-wide.
        if (tenantId == null) {
            return pjp.proceed();
        }

        if (!featureFlagService.isEnabled(tenantId, featureKey)) {
            log.warn("Feature '{}' not enabled for tenantId={}", featureKey, tenantId);
            throw new FeatureNotEnabledException(featureKey);
        }

        return pjp.proceed();
    }
}
