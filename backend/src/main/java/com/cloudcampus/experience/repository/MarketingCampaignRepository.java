package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.MarketingCampaign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MarketingCampaignRepository extends JpaRepository<MarketingCampaign, UUID> {
    List<MarketingCampaign> findAllByOrderByUpdatedAtDesc();

    List<MarketingCampaign> findByStatusOrderByUpdatedAtDesc(String status);
}
