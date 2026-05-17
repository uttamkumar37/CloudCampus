package com.cloudcampus.config;

import com.cloudcampus.common.ratelimit.RateLimitInterceptor;
import com.cloudcampus.demo.DemoModeInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;
    private final DemoModeInterceptor  demoModeInterceptor;

    public WebMvcConfig(RateLimitInterceptor rateLimitInterceptor,
                        DemoModeInterceptor demoModeInterceptor) {
        this.rateLimitInterceptor = rateLimitInterceptor;
        this.demoModeInterceptor  = demoModeInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor);
        registry.addInterceptor(demoModeInterceptor);
    }
}
