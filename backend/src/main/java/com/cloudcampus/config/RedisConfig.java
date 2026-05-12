package com.cloudcampus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis configuration.
 *
 * Provides a typed RedisTemplate<String, String> bean for use across the application:
 *   - Refresh tokens (auth)
 *   - Login rate-limit counters (brute-force protection, A4)
 *   - Feature flag cache (B4)
 *   - OTP storage (password reset, B10)
 *
 * Spring Boot auto-configures the connection via spring.data.redis.* in application.yml.
 * We override the serializers to use plain string keys and values — no Java serialization.
 */
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);

        template.afterPropertiesSet();
        return template;
    }
}
