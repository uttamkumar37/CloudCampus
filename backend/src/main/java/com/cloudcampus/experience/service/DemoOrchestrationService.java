package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.DemoStartRequest;
import com.cloudcampus.experience.dto.response.DemoScenarioResponse;
import com.cloudcampus.experience.dto.response.DemoSessionResponse;
import com.cloudcampus.experience.entity.DemoScenario;
import com.cloudcampus.experience.entity.DemoSession;
import com.cloudcampus.experience.repository.DemoScenarioRepository;
import com.cloudcampus.experience.repository.DemoSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class DemoOrchestrationService {

    private static final Logger log = LoggerFactory.getLogger(DemoOrchestrationService.class);

    private static final String BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String SEEDED_PARENT_DEMO_USERNAME = "gw.parent001";
    private static final String SEEDED_DEMO_PASSWORD = "Demo@1234";
    private static final String SEEDED_DEMO_LOGIN_URL = "/login";

    private final DemoScenarioRepository scenarioRepo;
    private final DemoSessionRepository  sessionRepo;
    private final boolean publicCredentialsEnabled;

    public DemoOrchestrationService(DemoScenarioRepository scenarioRepo,
                                    DemoSessionRepository sessionRepo,
                                    @Value("${app.demo.public-credentials-enabled:false}")
                                    boolean publicCredentialsEnabled) {
        this.scenarioRepo              = scenarioRepo;
        this.sessionRepo               = sessionRepo;
        this.publicCredentialsEnabled  = publicCredentialsEnabled;
    }

    public List<DemoScenarioResponse> listActiveScenarios() {
        return scenarioRepo.findByStatusOrderByDisplayOrderAsc("ACTIVE")
                .stream().map(DemoScenarioResponse::from).toList();
    }

    @Transactional
    public DemoSessionResponse startSession(DemoStartRequest req) {
        if (!publicCredentialsEnabled) {
            throw new ForbiddenException("Public demo credential issuance is disabled");
        }

        DemoScenario scenario = scenarioRepo
                .findBySlugAndStatus(req.scenarioSlug(), "ACTIVE")
                .orElseThrow(() -> new NotFoundException("Demo scenario not found: " + req.scenarioSlug()));

        String visitorToken = generateToken(32);
        // Use seeded demo credentials that actually authenticate in the demo tenant.
        String demoPassword = SEEDED_DEMO_PASSWORD;
        String demoUsername = SEEDED_PARENT_DEMO_USERNAME;

        // Phase 2: full ephemeral tenant provisioning via TenantProvisioningService.
        // For now we create the session record with a placeholder tenant.
        UUID placeholderTenantId = UUID.fromString("c0000000-0000-0000-0000-000000000001");

        Instant expiresAt = Instant.now().plus(scenario.getSessionTtlMin(), ChronoUnit.MINUTES);

        Map<String, Object> meta = Map.of(
                "utmSource",   req.utmSource()   != null ? req.utmSource()   : "",
                "utmMedium",   req.utmMedium()   != null ? req.utmMedium()   : "",
                "utmCampaign", req.utmCampaign() != null ? req.utmCampaign() : ""
        );

        DemoSession session = DemoSession.create(
                scenario.getId(), visitorToken,
                req.email(), meta,
                placeholderTenantId, demoUsername, expiresAt
        );
        sessionRepo.save(session);

        log.info("Demo session started: scenario={} token={} expires={}",
                req.scenarioSlug(), visitorToken.substring(0, 8) + "...", expiresAt);

        return new DemoSessionResponse(
                visitorToken,
            SEEDED_DEMO_LOGIN_URL,
                demoUsername,
                demoPassword,
                expiresAt,
                placeholderTenantId
        );
    }

    public DemoSessionResponse validateSession(String visitorToken) {
        DemoSession session = sessionRepo
                .findByVisitorTokenAndStatus(visitorToken, "ACTIVE")
                .orElseThrow(() -> new NotFoundException("Demo session not found or expired"));

        if (Instant.now().isAfter(session.getExpiresAt())) {
            throw new NotFoundException("Demo session has expired");
        }

        return new DemoSessionResponse(
                session.getVisitorToken(),
            SEEDED_DEMO_LOGIN_URL,
                session.getDemoUsername(),
                null,
                session.getExpiresAt(),
                session.getTenantId()
        );
    }

    @Scheduled(fixedDelay = 15 * 60 * 1000)
    @Transactional
    public void cleanupExpiredSessions() {
        int expired = sessionRepo.expireOldSessions(Instant.now());
        if (expired > 0) {
            log.info("Expired {} demo sessions", expired);
        }
    }

    private static String generateToken(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(BASE62.charAt(RANDOM.nextInt(BASE62.length())));
        }
        return sb.toString();
    }
}
