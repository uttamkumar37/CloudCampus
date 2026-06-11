package com.cloudcampus.config;

import java.util.List;

import com.cloudcampus.identity.accesscontrol.policy.RoutePolicyEnforcementInterceptor;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final List<String> allowedOrigins;
    private final ObjectProvider<RoutePolicyEnforcementInterceptor> routePolicyEnforcementInterceptorProvider;

    public CorsConfig(
            @Value("${cloudcampus.cors.allowed-origins:}") List<String> allowedOrigins,
            ObjectProvider<RoutePolicyEnforcementInterceptor> routePolicyEnforcementInterceptorProvider
    ) {
        this.allowedOrigins = allowedOrigins.stream()
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();
        this.routePolicyEnforcementInterceptorProvider = routePolicyEnforcementInterceptorProvider;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (allowedOrigins.isEmpty()) {
            return;
        }
        registry.addMapping("/v1/**")
                .allowedOrigins(allowedOrigins.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "Accept", "X-Correlation-Id", "X-Request-Id", "Idempotency-Key")
                .exposedHeaders("Location", "X-Correlation-Id")
                .allowCredentials(false)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        routePolicyEnforcementInterceptorProvider.ifAvailable(interceptor ->
                registry.addInterceptor(interceptor)
                        .addPathPatterns("/v1/**")
        );
    }
}
