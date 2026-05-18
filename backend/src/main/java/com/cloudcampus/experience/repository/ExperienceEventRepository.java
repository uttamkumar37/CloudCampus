package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.ExperienceEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ExperienceEventRepository extends JpaRepository<ExperienceEvent, UUID> {

    @Query("""
        SELECT e.eventType, COUNT(e) FROM ExperienceEvent e
        WHERE e.createdAt >= :from AND e.createdAt < :to
        GROUP BY e.eventType
        ORDER BY COUNT(e) DESC
    """)
    List<Object[]> countByEventTypeBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query("""
        SELECT COUNT(DISTINCT e.sessionId) FROM ExperienceEvent e
        WHERE e.eventType = :eventType
          AND e.createdAt >= :from AND e.createdAt < :to
    """)
    long countDistinctSessionsByType(@Param("eventType") String eventType,
                                     @Param("from") Instant from,
                                     @Param("to") Instant to);
}
