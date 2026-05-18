package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.MarketingCampaignStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MarketingCampaignStepRepository extends JpaRepository<MarketingCampaignStep, UUID> {
    List<MarketingCampaignStep> findByCampaignIdOrderByPositionAsc(UUID campaignId);

    void deleteByCampaignId(UUID campaignId);
}
