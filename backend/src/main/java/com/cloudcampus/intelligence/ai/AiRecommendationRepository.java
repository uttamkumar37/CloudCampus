package com.cloudcampus.intelligence.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AiRecommendationRepository extends JpaRepository<AiRecommendation, String>, JpaSpecificationExecutor<AiRecommendation> {
}
