package com.cloudcampus.config;

import com.cloudcampus.auth.security.JwtAuthenticationFilter;
import com.cloudcampus.common.web.JsonAuthEntryPoint;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
 *        /v1/auth/**           — login, refresh, logout
 *
 * Role-restricted routes:
 *   /v1/super-admin/**  → SUPER_ADMIN only
 *   /v1/admin/**        → TENANT_ADMIN or SUPER_ADMIN
 *   /v1/school-admin/** → SCHOOL_ADMIN, TENANT_ADMIN, or SUPER_ADMIN
 *
 * Everything else: authenticated (any valid JWT is sufficient).
 *
 * Roles are set by JwtAuthenticationFilter as ROLE_{enumName} authorities
 * (e.g. ROLE_SUPER_ADMIN, ROLE_TENANT_ADMIN). Spring Security's hasRole()
 * automatically prepends ROLE_ so the string passed here is just the suffix.
 */
@Configuration
@EnableWebSecurity
@EnableConfigurationProperties({JwtProperties.class, RateLimitProperties.class, OtpProperties.class})
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JsonAuthEntryPoint jsonAuthEntryPoint;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JsonAuthEntryPoint jsonAuthEntryPoint) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jsonAuthEntryPoint = jsonAuthEntryPoint;
    }

    /**
     * BCrypt with strength 12 — production-safe cost factor.
     * Cost 12 ≈ 300 ms/hash on modern hardware: slow enough to deter brute-force,
     * fast enough for login throughput.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
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

                // ── Authorization rules (CC-0113 / CC-0114) ─────────────────────
                .authorizeHttpRequests(auth -> auth
                        // ── Always public — no token required ──────────────────────────
                        .requestMatchers(HttpMethod.GET,
                                "/actuator/health/**",
                                "/actuator/info").permitAll()
                        .requestMatchers("/v1/public/**").permitAll()
                        .requestMatchers("/v1/auth/**").permitAll()
                        // Swagger UI / OpenAPI — enabled in dev profile only (springdoc.*.enabled).
                        // Even if enabled, the paths are public so the UI is accessible without a token.
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs",
                                "/v3/api-docs/**").permitAll()

                        // ── Super-admin only ────────────────────────────────────────────
                        .requestMatchers("/v1/super-admin/**")
                                .hasRole("SUPER_ADMIN")

                        // ── Tenant admin (and above) ────────────────────────────────────
                        .requestMatchers("/v1/admin/**")
                                .hasAnyRole("TENANT_ADMIN", "SUPER_ADMIN")

                        // ── School admin (and above) ────────────────────────────────────
                        .requestMatchers("/v1/school-admin/**")
                                .hasAnyRole("SCHOOL_ADMIN", "TENANT_ADMIN", "SUPER_ADMIN")

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
     * Current: Dev-permissive (allows localhost origins).
     * Production: override allowed origins via CORS_ALLOWED_ORIGINS environment variable.
     * Never use allowedOrigins("*") for authenticated APIs.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // TODO: Replace with environment-variable-driven origin list before production.
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",      // local dev
                "https://*.cloudcampus.io" // production domains
        ));
        config.setAllowedMethods(List.of(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.PATCH.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name()
        ));
        config.setAllowedHeaders(List.of("*"));
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
