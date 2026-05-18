package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.response.PublicRenderProfileResponse;
import com.cloudcampus.experience.entity.BrandSystem;
import com.cloudcampus.experience.entity.StakeholderJourney;
import com.cloudcampus.experience.entity.WebsiteRouteConfig;
import com.cloudcampus.experience.repository.BrandSystemRepository;
import com.cloudcampus.experience.repository.StakeholderJourneyRepository;
import com.cloudcampus.experience.repository.WebsiteRouteConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ExperienceRenderProfileService {

    private final BrandSystemRepository brandSystemRepository;
    private final WebsiteRouteConfigRepository websiteRouteConfigRepository;
    private final StakeholderJourneyRepository stakeholderJourneyRepository;

    public ExperienceRenderProfileService(BrandSystemRepository brandSystemRepository,
                                          WebsiteRouteConfigRepository websiteRouteConfigRepository,
                                          StakeholderJourneyRepository stakeholderJourneyRepository) {
        this.brandSystemRepository = brandSystemRepository;
        this.websiteRouteConfigRepository = websiteRouteConfigRepository;
        this.stakeholderJourneyRepository = stakeholderJourneyRepository;
    }

    public PublicRenderProfileResponse resolve(String routePath, String audienceType, String brandCode) {
        WebsiteRouteConfig route = websiteRouteConfigRepository.findFirstByRoutePathAndPublishedTrue(routePath)
                .orElseThrow(() -> new NotFoundException("Published route not found: " + routePath));

        BrandSystem brand = (brandCode == null || brandCode.isBlank())
                ? brandSystemRepository.findFirstByPublishedTrueOrderByUpdatedAtDesc()
                    .orElseThrow(() -> new NotFoundException("No published brand system found"))
                : brandSystemRepository.findFirstByCodeAndPublishedTrueOrderByUpdatedAtDesc(brandCode)
                    .orElseThrow(() -> new NotFoundException("Published brand system not found: " + brandCode));

        StakeholderJourney journey = stakeholderJourneyRepository
                .findFirstByStakeholderTypeAndPublishedTrueOrderByUpdatedAtDesc(audienceType)
                .orElseThrow(() -> new NotFoundException("Published stakeholder journey not found: " + audienceType));

        return new PublicRenderProfileResponse(
                route.getAudienceType(),
                route.getRoutePath(),
                brand.getCode(),
                nullSafeMap(brand.getTokenJson()),
                nullSafeMap(brand.getTypographyJson()),
                nullSafeMap(brand.getMotionJson()),
                nullSafeMap(route.getSeoJson()),
                nullSafeMap(route.getLayoutJson()),
                nullSafeMap(route.getCtaJson()),
                journey.getJourneyKey(),
                journey.getConversionGoal(),
                nullSafeMap(journey.getNarrativeJson()),
                journey.getTouchpointsJson() == null ? java.util.List.of() : journey.getTouchpointsJson()
        );
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Map.of() : input;
    }
}
