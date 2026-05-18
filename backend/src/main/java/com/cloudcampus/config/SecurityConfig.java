package com.cloudcampus.config;

import com.cloudcampus.auth.security.JwtAuthenticationFilter;
import com.cloudcampus.common.tenant.TenantSuspensionFilter;
import com.cloudcampus.common.web.JsonAuthEntryPoint;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Security configuration — Phase A (Auth Enforcement) — CC-0113 / CC-0114.
 *
 * RBAC matchers are evaluated top-to-bottom; first match wins.
 *
 * Public routes (no token required):
 *   GET  /actuator/health/**   — load-balancer health checks
 *   GET  /actuator/info        — version metadata
 *        /v1/public/**         — future public endpoints (school search, etc.)
 *   POST /v1/auth/login        — username/password login
 *   POST /v1/auth/refresh      — refresh-token rotation
 *   POST /v1/auth/logout       — best-effort refresh-token revocation
 *   POST /v1/auth/forgot-password, /reset-password — OTP password reset
 *
 * Role-restricted routes:
 *   /v1/super-admin/**  → SUPER_ADMIN only
 *   /v1/admin/**        → TENANT_ADMIN or SUPER_ADMIN
 *   /v1/school-admin/** → SCHOOL_ADMIN or TENANT_ADMIN
 *
 * Everything else: authenticated (any valid JWT is sufficient).
 *
 * Roles are set by JwtAuthenticationFilter as ROLE_{enumName} authorities
 * (e.g. ROLE_SUPER_ADMIN, ROLE_TENANT_ADMIN). Spring Security's hasRole()
 * automatically prepends ROLE_ so the string passed here is just the suffix.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties({JwtProperties.class, RateLimitProperties.class, OtpProperties.class,
        com.cloudcampus.common.ratelimit.ApiRateLimitProperties.class,
        com.cloudcampus.common.crypto.EncryptionProperties.class,
        com.cloudcampus.common.retention.RetentionProperties.class,
        com.cloudcampus.payment.config.RazorpayProperties.class})
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final TenantSuspensionFilter  tenantSuspensionFilter;
    private final JsonAuthEntryPoint      jsonAuthEntryPoint;

    @Value("${cors.allowed-origins:}")
    private String corsAllowedOrigins;

    // L-09: inject actual springdoc paths so security permits exactly the paths
    // springdoc serves — they cannot drift if application.yml is changed.
    @Value("${springdoc.api-docs.path:/v3/api-docs}")
    private String apiDocsPath;

    @Value("${springdoc.swagger-ui.path:/swagger-ui.html}")
    private String swaggerUiPath;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            TenantSuspensionFilter  tenantSuspensionFilter,
            JsonAuthEntryPoint      jsonAuthEntryPoint) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.tenantSuspensionFilter  = tenantSuspensionFilter;
        this.jsonAuthEntryPoint      = jsonAuthEntryPoint;
    }

    /**
     * BCrypt with strength 10 — production-safe cost factor.
     * L-15: cost 12 (≈300 ms/hash) saturates virtual threads under concurrent login;
     * cost 10 (≈100 ms/hash) still exceeds OWASP recommendation and allows ~10× more
     * concurrent logins before the thread pool backs up.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    /**
     * Prevent Spring Boot from auto-registering these @Component filters as plain
     * Servlet filters outside the Security filter chain. They must only run inside
     * the chain (via addFilterBefore/addFilterAfter above), otherwise OncePerRequestFilter
     * blocks their second execution inside the chain and the SecurityContext set by the
     * Servlet-level run is wiped by SecurityContextHolderFilter, causing 401 on all
     * authenticated endpoints.
     */
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(
            JwtAuthenticationFilter filter) {
        FilterRegistrationBean<JwtAuthenticationFilter> bean = new FilterRegistrationBean<>(filter);
        bean.setEnabled(false);
        return bean;
    }

    @Bean
    public FilterRegistrationBean<TenantSuspensionFilter> tenantSuspensionFilterRegistration(
            TenantSuspensionFilter filter) {
        FilterRegistrationBean<TenantSuspensionFilter> bean = new FilterRegistrationBean<>(filter);
        bean.setEnabled(false);
        return bean;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // Disable CSRF — stateless REST API, no cookies for auth.
                .csrf(AbstractHttpConfigurer::disable)

                // Stateless — no HttpSession created or used.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // CORS — configured below. Lock down allowed origins in production.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ── JWT filter — populates SecurityContext when token is present ────
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // ── Tenant suspension filter — rejects SUSPENDED tenant requests ──
                .addFilterAfter(tenantSuspensionFilter, JwtAuthenticationFilter.class)

                // ── Authorization rules (CC-0113 / CC-0114) ─────────────────────
                .authorizeHttpRequests(auth -> auth
                        // ── Always public — no token required ──────────────────────────
                        .requestMatchers(HttpMethod.GET,
                                "/actuator/health/**",
                                "/actuator/info").permitAll()
                        .requestMatchers("/v1/public/**").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/v1/auth/login",
                                "/v1/auth/refresh",
                                "/v1/auth/logout",
                                "/v1/auth/forgot-password",
                                "/v1/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/v1/payment/webhooks/razorpay").permitAll()
                        // DSEP — public experience platform endpoints (no auth required)
                        .requestMatchers("/v1/experience/public/**").permitAll()
                        // L-09: Swagger UI / OpenAPI paths are derived from springdoc config
                        // properties so they can never drift from what springdoc actually serves.
                        .requestMatchers(
                                swaggerUiPath,
                                swaggerUiPath.replace(".html", "") + "/**",
                                apiDocsPath,
                                apiDocsPath + "/**").permitAll()

                        // ── Super-admin only ────────────────────────────────────────────
                        .requestMatchers("/v1/super-admin/**")
                                .hasRole("SUPER_ADMIN")

                        // ── Tenant admin (and above) ────────────────────────────────────
                        .requestMatchers("/v1/admin/**")
                                .hasAnyRole("TENANT_ADMIN", "SUPER_ADMIN")

                        // ── School admin / tenant admin ──────────────────────────────────
                        .requestMatchers("/v1/school-admin/**")
                                .hasAnyRole("SCHOOL_ADMIN", "TENANT_ADMIN")

                        // ── Everything else: any valid JWT ──────────────────────────────
                        .anyRequest().authenticated()
                )
                // ── Custom JSON error responses for Spring Security rejections ────
                // Without this, Spring Security returns HTML pages for 401 / 403.
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jsonAuthEntryPoint)  // 401
                        .accessDeniedHandler(jsonAuthEntryPoint)        // 403
                )
                .build();
    }

    /**
     * CORS policy.
     *
     * Default patterns cover local dev and *.cloudcampus.io.
     * Override via cors.allowed-origins (comma-separated) or the
     * CORS_ALLOWED_ORIGINS environment variable for staging/production.
     * Never use allowedOrigins("*") for authenticated APIs.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        List<String> patterns = new ArrayList<>(List.of(
                "http://localhost:*",
                "https://*.cloudcampus.io"
        ));
        if (corsAllowedOrigins != null && !corsAllowedOrigins.isBlank()) {
            Arrays.stream(corsAllowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(patterns::add);
        }
        config.setAllowedOriginPatterns(patterns);
        config.setAllowedMethods(List.of(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.PATCH.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name()
        ));
        // Explicit header allowlist — never wildcard on authenticated APIs.
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With",
                "X-Tenant-Id"
        ));
        config.setExposedHeaders(List.of(
                "X-Correlation-Id",
                "X-Tenant-Id"
        ));
        config.setAllowCredentials(false);   // false = JWT in Authorization header, not cookies.
        config.setMaxAge(3600L);             // Preflight cache: 1 hour.

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
