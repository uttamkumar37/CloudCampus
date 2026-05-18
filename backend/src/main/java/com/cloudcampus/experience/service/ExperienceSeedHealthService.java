package com.cloudcampus.experience.service;

import com.cloudcampus.experience.dto.response.ExperienceSeedHealthResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class ExperienceSeedHealthService {

    private static final List<String> REQUIRED_AUDIENCES = List.of(
            "INVESTOR",
            "SCHOOL_OWNER",
            "PRINCIPAL",
            "TEACHER",
            "PARENT",
            "STUDENT",
            "FRANCHISE_PARTNER",
            "GOVERNMENT_AUTHORITY",
            "ENTERPRISE_CUSTOMER",
            "MARKETING_CAMPAIGN"
    );

    private final BrandSystemService brandSystemService;
    private final WebsiteRouteService websiteRouteService;
    private final StakeholderJourneyService stakeholderJourneyService;
    private final DemoOrchestrationService demoOrchestrationService;
    private final InvestorRoomService investorRoomService;
    private final PresentationService presentationService;
    private final ContentBlockService contentBlockService;
        private final MarketingCampaignService marketingCampaignService;
        private final WebsiteTemplateService websiteTemplateService;
        private final StorySceneService storySceneService;
        private final TrustModuleService trustModuleService;

    public ExperienceSeedHealthService(BrandSystemService brandSystemService,
                                       WebsiteRouteService websiteRouteService,
                                       StakeholderJourneyService stakeholderJourneyService,
                                       DemoOrchestrationService demoOrchestrationService,
                                       InvestorRoomService investorRoomService,
                                       PresentationService presentationService,
                                                                           ContentBlockService contentBlockService,
                                                                           MarketingCampaignService marketingCampaignService,
                                                                           WebsiteTemplateService websiteTemplateService,
                                                                           StorySceneService storySceneService,
                                                                           TrustModuleService trustModuleService) {
        this.brandSystemService = brandSystemService;
        this.websiteRouteService = websiteRouteService;
        this.stakeholderJourneyService = stakeholderJourneyService;
        this.demoOrchestrationService = demoOrchestrationService;
        this.investorRoomService = investorRoomService;
        this.presentationService = presentationService;
        this.contentBlockService = contentBlockService;
                this.marketingCampaignService = marketingCampaignService;
                this.websiteTemplateService = websiteTemplateService;
                this.storySceneService = storySceneService;
                this.trustModuleService = trustModuleService;
    }

    public ExperienceSeedHealthResponse evaluate() {
        int publishedBrandSystems = (int) brandSystemService.listAll().stream().filter(b -> b.published()).count();
        var routes = websiteRouteService.listAll();
        int publishedWebsiteRoutes = (int) routes.stream().filter(r -> r.published()).count();
        var journeys = stakeholderJourneyService.listAll();
        int publishedStakeholderJourneys = (int) journeys.stream().filter(j -> j.published()).count();
        int activeDemoScenarios = demoOrchestrationService.listActiveScenarios().size();
        int activeInvestorRooms = investorRoomService.listActive().size();
        int publishedPresentations = (int) presentationService.listAll().stream().filter(p -> "PUBLISHED".equalsIgnoreCase(p.status())).count();
        int publishedContentBlocks = (int) contentBlockService.listGlobal().stream().filter(c -> c.published()).count();
        int activeCampaigns = marketingCampaignService.listActive().size();
        int publishedTemplates = websiteTemplateService.listPublished().size();
        int publishedStoryScenes = storySceneService.listPublished(null).size();
        int publishedTrustModules = trustModuleService.listPublished().size();

        Set<String> routeAudiences = new LinkedHashSet<>(
                routes.stream().filter(r -> r.published()).map(r -> r.audienceType()).toList()
        );
        Set<String> journeyAudiences = new LinkedHashSet<>(
                journeys.stream().filter(j -> j.published()).map(j -> j.stakeholderType()).toList()
        );

        List<String> missingRouteAudiences = REQUIRED_AUDIENCES.stream()
                .filter(a -> !routeAudiences.contains(a))
                .toList();

        List<String> missingJourneyAudiences = REQUIRED_AUDIENCES.stream()
                .filter(a -> !journeyAudiences.contains(a))
                .toList();

        Map<String, Boolean> checks = new LinkedHashMap<>();
        checks.put("publishedBrandSystems", publishedBrandSystems >= 1);
        checks.put("requiredRouteAudienceCoverage", missingRouteAudiences.isEmpty());
        checks.put("requiredJourneyAudienceCoverage", missingJourneyAudiences.isEmpty());
        checks.put("minimumDemoScenarios", activeDemoScenarios >= 3);
        checks.put("minimumInvestorRooms", activeInvestorRooms >= 1);
        checks.put("minimumPublishedPresentations", publishedPresentations >= 3);
        checks.put("minimumPublishedContentBlocks", publishedContentBlocks >= 10);
        checks.put("minimumActiveCampaigns", activeCampaigns >= 1);
        checks.put("minimumPublishedTemplates", publishedTemplates >= 1);
        checks.put("minimumPublishedStoryScenes", publishedStoryScenes >= 1);
        checks.put("minimumPublishedTrustModules", publishedTrustModules >= 1);

        boolean ready = checks.values().stream().allMatch(Boolean::booleanValue);

        return new ExperienceSeedHealthResponse(
                ready,
                REQUIRED_AUDIENCES.size(),
                publishedBrandSystems,
                publishedWebsiteRoutes,
                publishedStakeholderJourneys,
                activeDemoScenarios,
                activeInvestorRooms,
                publishedPresentations,
                publishedContentBlocks,
                missingRouteAudiences,
                missingJourneyAudiences,
                checks
        );
    }
}
