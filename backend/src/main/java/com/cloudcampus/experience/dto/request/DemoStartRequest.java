package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DemoStartRequest(
        @NotBlank @Size(max = 120) String scenarioSlug,
        @Email @Size(max = 254) String email,
        @Size(max = 120) String utmSource,
        @Size(max = 120) String utmMedium,
        @Size(max = 120) String utmCampaign
) {}
