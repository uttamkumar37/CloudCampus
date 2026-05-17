package com.cloudcampus.config;

import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.redis.spring.RedisLockProvider;
import net.javacrumbs.shedlock.spring.annotation.EnableSchedulerLock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Distributed scheduler locking via ShedLock + Redis (CRIT-19).
 *
 * Without this, every pod in a scaled-out deployment runs @Scheduled jobs
 * independently — causing duplicate fee reminder emails, double data-retention
 * purges, and multiple demo resets per night.
 *
 * ShedLock stores a lock key in Redis with a TTL equal to lockAtMostFor.
 * Only the first pod that acquires the lock executes the job; all others skip.
 */
@Configuration
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "PT30M")
public class ShedLockConfig {

    @Bean
    LockProvider lockProvider(RedisConnectionFactory redisConnectionFactory) {
        return new RedisLockProvider(redisConnectionFactory);
    }
}
