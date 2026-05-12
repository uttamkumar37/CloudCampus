package com.cloudcampus.common.exception;

/**
 * Thrown by {@link com.cloudcampus.feature.aop.RequiresFeatureAspect} when a feature
 * is not enabled for the current tenant. Maps to HTTP 403 in RestExceptionHandler.
 */
public class FeatureNotEnabledException extends RuntimeException {

    private final String featureKey;

    public FeatureNotEnabledException(String featureKey) {
        super("Feature not enabled for your subscription plan");
        this.featureKey = featureKey;
    }

    public String getFeatureKey() {
        return featureKey;
    }
}
