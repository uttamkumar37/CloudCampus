package com.cloudcampus.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

/**
 * Spring Cache backed by Redis (CC-1702).
 *
 * Cache names and TTLs:
 *   academic-years  — 10 min  (changes at most a few times per year)
 *   classes         — 10 min  (changes at most a few times per year)
 *   subjects        — 10 min  (rarely changes mid-year)
 *   sections        —  5 min  (slightly more dynamic than the above)
 *   departments     — 10 min
 *
 * Keys use the first method parameter (schoolId / academicYearId / classId) as a string.
 * All entries are evicted (allEntries = true) on any write to keep eviction logic simple.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    private static final GenericJackson2JsonRedisSerializer JSON =
            new GenericJackson2JsonRedisSerializer();

    private static RedisCacheConfiguration ttl(long minutes) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(minutes))
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(JSON))
                .disableCachingNullValues();
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(ttl(5))
                .withInitialCacheConfigurations(Map.of(
                        "academic-years", ttl(10),
                        "classes",        ttl(10),
                        "subjects",       ttl(10),
                        "sections",       ttl(5),
                        "departments",    ttl(10)
                ))
                .build();
    }
}
