package com.cloudcampus.ai.usage.repository;

import com.cloudcampus.ai.usage.entity.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, UUID> {
}
