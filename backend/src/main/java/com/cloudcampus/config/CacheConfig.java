package com.cloudcampus.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Collection;
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
public class CacheConfig implements CachingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    /**
     * Build a Redis value serializer from the application ObjectMapper.
     *
     * Uses EVERYTHING typing (not NON_FINAL) so that Java records, which are implicitly
     * final, also receive @class type metadata and can be round-tripped through Redis.
     * The PolymorphicTypeValidator restricts allowed types to CloudCampus DTOs and
     * standard Java types — no arbitrary class loading.
     */
    @SuppressWarnings("deprecation")
    private static GenericJackson2JsonRedisSerializer buildSerializer(ObjectMapper base) {
        PolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfSubType("com.cloudcampus.")
                .allowIfSubType("java.util.")
                .allowIfSubType("java.time.")
                .allowIfSubType(Collection.class)
                .allowIfSubType(Map.class)
                .allowIfSubType(Number.class)
                .allowIfSubType(String.class)
                .build();

        // EVERYTHING (vs NON_FINAL) is needed so that Java records — which are implicitly
        // final — also receive @class type metadata and can round-trip through Redis.
        // The ptv validator restricts deserialization to safe CloudCampus + JDK types only.
        ObjectMapper redisMapper = base.copy()
                .activateDefaultTypingAsProperty(
                        ptv,
                        ObjectMapper.DefaultTyping.EVERYTHING,
                        "@class");

        return new GenericJackson2JsonRedisSerializer(redisMapper);
    }

    private static RedisCacheConfiguration ttl(long minutes, GenericJackson2JsonRedisSerializer json) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(minutes))
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(json))
                .disableCachingNullValues();
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory,
                                          ObjectMapper objectMapper) {
        GenericJackson2JsonRedisSerializer json = buildSerializer(objectMapper);
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(ttl(5, json))
                .withInitialCacheConfigurations(Map.of(
                        "academic-years", ttl(10, json),
                        "classes",        ttl(10, json),
                        "subjects",       ttl(10, json),
                        "sections",       ttl(5,  json),
                        "departments",    ttl(10, json)
                ))
                .enableStatistics()
                .build();
    }

    /**
     * Log cache errors and fall through to the real method rather than propagating
     * the exception as a 500. A stale or unavailable cache should never break a read API.
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException e, Cache cache, Object key) {
                log.warn("Cache GET error [{}::{}]: {}", cache.getName(), key, e.getMessage());
            }
            @Override
            public void handleCachePutError(RuntimeException e, Cache cache, Object key, Object value) {
                log.warn("Cache PUT error [{}::{}]: {}", cache.getName(), key, e.getMessage());
            }
            @Override
            public void handleCacheEvictError(RuntimeException e, Cache cache, Object key) {
                log.warn("Cache EVICT error [{}::{}]: {}", cache.getName(), key, e.getMessage());
            }
            @Override
            public void handleCacheClearError(RuntimeException e, Cache cache) {
                log.warn("Cache CLEAR error [{}]: {}", cache.getName(), e.getMessage());
            }
        };
    }
}
