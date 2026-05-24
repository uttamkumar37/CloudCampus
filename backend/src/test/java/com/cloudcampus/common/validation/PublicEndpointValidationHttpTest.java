package com.cloudcampus.common.validation;

import com.cloudcampus.experience.controller.InvestorRoomController;
import com.cloudcampus.experience.controller.PublicExperienceController;
import com.cloudcampus.experience.service.ContentBlockService;
import com.cloudcampus.experience.service.DemoOrchestrationService;
import com.cloudcampus.experience.service.ExperienceEventPublisher;
import com.cloudcampus.experience.service.ExperienceRenderProfileService;
import com.cloudcampus.experience.service.InvestorRoomService;
import com.cloudcampus.experience.service.MarketingCampaignService;
import com.cloudcampus.experience.service.StorySceneService;
import com.cloudcampus.experience.service.TrustModuleService;
import com.cloudcampus.experience.service.WebsiteTemplateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicEndpointValidationHttpTest {

    private MockMvc mockMvc;
    private LocalValidatorFactoryBean validator;

    @BeforeEach
    void setUp() {
        validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        PublicExperienceController publicController = new PublicExperienceController(
                mock(ContentBlockService.class),
                mock(DemoOrchestrationService.class),
                mock(ExperienceEventPublisher.class),
                mock(ExperienceRenderProfileService.class),
                mock(WebsiteTemplateService.class),
                mock(StorySceneService.class),
                mock(TrustModuleService.class),
                mock(MarketingCampaignService.class));

        InvestorRoomController investorController =
                new InvestorRoomController(mock(InvestorRoomService.class));

        mockMvc = MockMvcBuilders.standaloneSetup(publicController, investorController)
                .setValidator(validator)
                .build();
    }

    @Test
    void demoStartRejectsBlankScenarioBeforeServiceLayer() throws Exception {
        mockMvc.perform(post("/v1/experience/public/demo/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"scenarioSlug":"","email":"not-an-email"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void analyticsIngestRejectsMalformedEventBatchBeforePublishing() throws Exception {
        mockMvc.perform(post("/v1/experience/public/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"events":[{"sessionId":"","eventType":""}]}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void investorRoomAccessRejectsBlankPasswordBeforeServiceLayer() throws Exception {
        mockMvc.perform(post("/v1/experience/public/investor/room-code/access")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"password":""}
                                """))
                .andExpect(status().isBadRequest());
    }
}
