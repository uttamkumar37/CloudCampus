package com.cloudcampus.platform.superadmin.stats;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SchoolStatsRepository extends JpaRepository<SchoolStats, String> {

    List<SchoolStats> findBySchoolIdIn(Collection<String> schoolIds);

    @Modifying
    @Query("""
            update SchoolStats stats
            set stats.lastActivityAt = :activityAt,
                stats.updatedAt = :activityAt
            where stats.schoolId = :schoolId
              and (stats.lastActivityAt is null or stats.lastActivityAt < :activityAt)
            """)
    void touchActivity(@Param("schoolId") String schoolId, @Param("activityAt") Instant activityAt);
}
