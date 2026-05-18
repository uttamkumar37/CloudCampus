package com.cloudcampus.experience.dto.response;

import java.util.List;
import java.util.Map;

public record ExperienceSeedHealthResponse(
        boolean ready,
        int requiredAudienceCount,
        int publishedBrandSystems,
        int publishedWebsiteRoutes,
        int publishedStakeholderJourneys,
        int activeDemoScenarios,
        int activeInvestorRooms,
        int publishedPresentations,
        int publishedContentBlocks,
        List<String> missingRouteAudiences,
        List<String> missingJourneyAudiences,
        Map<String, Boolean> checks
) {}
