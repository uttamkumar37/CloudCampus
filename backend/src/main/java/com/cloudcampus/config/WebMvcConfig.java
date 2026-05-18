package com.cloudcampus.config;

import com.cloudcampus.common.ratelimit.RateLimitInterceptor;
import com.cloudcampus.common.ratelimit.PublicRateLimitInterceptor;
import com.cloudcampus.demo.DemoModeInterceptor;
import com.cloudcampus.school.security.SchoolPathAccessInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;
    private final PublicRateLimitInterceptor publicRateLimitInterceptor;
    private final DemoModeInterceptor  demoModeInterceptor;
    private final SchoolPathAccessInterceptor schoolPathAccessInterceptor;

    public WebMvcConfig(RateLimitInterceptor rateLimitInterceptor,
                        PublicRateLimitInterceptor publicRateLimitInterceptor,
                        DemoModeInterceptor demoModeInterceptor,
                        SchoolPathAccessInterceptor schoolPathAccessInterceptor) {
        this.rateLimitInterceptor       = rateLimitInterceptor;
        this.publicRateLimitInterceptor = publicRateLimitInterceptor;
        this.demoModeInterceptor        = demoModeInterceptor;
        this.schoolPathAccessInterceptor = schoolPathAccessInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(publicRateLimitInterceptor)
                .addPathPatterns("/v1/experience/public/**",
                        "/v1/public/**",
                        "/v1/payment/webhooks/**");
        registry.addInterceptor(rateLimitInterceptor);
        registry.addInterceptor(schoolPathAccessInterceptor)
                .addPathPatterns("/v1/school-admin/schools/{schoolId}",
                        "/v1/school-admin/schools/{schoolId}/**");
        registry.addInterceptor(demoModeInterceptor);
    }
}
