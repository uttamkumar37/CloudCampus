package com.cloudcampus.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
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
public class CacheConfig {

    /**
     * Build a Redis value serializer from the application ObjectMapper.
     *
     * We copy the main ObjectMapper and activate NON_FINAL default typing so Redis can
     * reconstruct the concrete type on read. The validator explicitly allows the packages
     * used by CloudCampus DTOs and java.time types so Jackson records serialise cleanly.
     */
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

        ObjectMapper redisMapper = base.copy()
                .activateDefaultTypingAsProperty(
                        ptv,
                        ObjectMapper.DefaultTyping.NON_FINAL,
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
                .build();
    }
}
