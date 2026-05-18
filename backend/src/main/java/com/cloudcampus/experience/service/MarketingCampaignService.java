package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.MarketingCampaignCreateRequest;
import com.cloudcampus.experience.dto.request.MarketingCampaignStepRequest;
import com.cloudcampus.experience.dto.request.MarketingCampaignUpdateRequest;
import com.cloudcampus.experience.dto.response.MarketingCampaignResponse;
import com.cloudcampus.experience.dto.response.MarketingCampaignStepResponse;
import com.cloudcampus.experience.entity.MarketingCampaign;
import com.cloudcampus.experience.entity.MarketingCampaignStep;
import com.cloudcampus.experience.repository.MarketingCampaignRepository;
import com.cloudcampus.experience.repository.MarketingCampaignStepRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class MarketingCampaignService {

    private final MarketingCampaignRepository campaignRepository;
    private final MarketingCampaignStepRepository stepRepository;

    public MarketingCampaignService(MarketingCampaignRepository campaignRepository,
                                    MarketingCampaignStepRepository stepRepository) {
        this.campaignRepository = campaignRepository;
        this.stepRepository = stepRepository;
    }

    public List<MarketingCampaignResponse> listAll() {
        return campaignRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toResponse).toList();
    }

    public List<MarketingCampaignResponse> listActive() {
        return campaignRepository.findByStatusOrderByUpdatedAtDesc("ACTIVE").stream().map(this::toResponse).toList();
    }

    @Transactional
    public MarketingCampaignResponse create(MarketingCampaignCreateRequest req, UUID actorId) {
        MarketingCampaign created = MarketingCampaign.create(
                req.name(),
                req.campaignType(),
                nullSafeMap(req.audienceFilter()),
                req.triggerType(),
                nullSafeMap(req.triggerConfig()),
                actorId
        );
        MarketingCampaign saved = campaignRepository.save(created);
        replaceSteps(saved.getId(), req.steps());
        return toResponse(saved);
    }

    @Transactional
    public MarketingCampaignResponse update(UUID id, MarketingCampaignUpdateRequest req) {
        MarketingCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Campaign not found"));
        campaign.update(
                req.name(),
                req.campaignType(),
                nullSafeMap(req.audienceFilter()),
                req.triggerType(),
                nullSafeMap(req.triggerConfig())
        );
        MarketingCampaign saved = campaignRepository.save(campaign);
        replaceSteps(saved.getId(), req.steps());
        return toResponse(saved);
    }

    @Transactional
    public MarketingCampaignResponse publish(UUID id) {
        MarketingCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Campaign not found"));
        campaign.publish();
        return toResponse(campaignRepository.save(campaign));
    }

    @Transactional
    public MarketingCampaignResponse pause(UUID id) {
        MarketingCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Campaign not found"));
        campaign.pause();
        return toResponse(campaignRepository.save(campaign));
    }

    private void replaceSteps(UUID campaignId, List<MarketingCampaignStepRequest> steps) {
        stepRepository.deleteByCampaignId(campaignId);
        if (steps == null || steps.isEmpty()) {
            return;
        }
        List<MarketingCampaignStep> payload = steps.stream()
                .map(step -> MarketingCampaignStep.create(
                        campaignId,
                        step.position(),
                        Math.max(step.delayMinutes(), 0),
                        step.actionType(),
                        nullSafeMap(step.actionConfig())
                ))
                .toList();
        stepRepository.saveAll(payload);
    }

    private MarketingCampaignResponse toResponse(MarketingCampaign campaign) {
        List<MarketingCampaignStepResponse> steps = stepRepository.findByCampaignIdOrderByPositionAsc(campaign.getId())
                .stream()
                .map(MarketingCampaignStepResponse::from)
                .toList();
        return MarketingCampaignResponse.from(campaign, steps);
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Collections.emptyMap() : input;
    }
}
