package com.cloudcampus.common.health;

import java.time.Instant;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/system")
public class SystemReadinessController {

    @GetMapping("/readiness")
    public SystemReadinessResponse readiness() {
        return new SystemReadinessResponse("UP", "cloudcampus-backend", "scaffold", Instant.now());
    }

    public record SystemReadinessResponse(
            String status,
            String application,
            String mode,
            Instant checkedAt
    ) {
    }
}
