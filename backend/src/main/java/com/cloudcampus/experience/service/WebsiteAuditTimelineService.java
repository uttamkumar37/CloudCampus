package com.cloudcampus.experience.service;

import com.cloudcampus.experience.dto.response.WebsiteAuditTimelineEventResponse;
import com.cloudcampus.experience.entity.WebsiteAuditTimelineEvent;
import com.cloudcampus.experience.repository.ExperienceWebsiteAuditTimelineRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class WebsiteAuditTimelineService {

    private static final int DEFAULT_LIMIT = 50;
    private static final int MAX_LIMIT = 100;

    private final ExperienceWebsiteAuditTimelineRepository timelineRepository;

    public WebsiteAuditTimelineService(ExperienceWebsiteAuditTimelineRepository timelineRepository) {
        this.timelineRepository = timelineRepository;
    }

    @Transactional
    public void record(String eventType,
                       String resourceType,
                       UUID resourceId,
                       String resourceLabel,
                       UUID actorId,
                       Map<String, Object> detailsJson) {
        timelineRepository.save(WebsiteAuditTimelineEvent.create(
                eventType,
                resourceType,
                resourceId,
                blankToUnknown(resourceLabel),
                actorId,
                detailsJson
        ));
    }

    public List<WebsiteAuditTimelineEventResponse> list(int limit) {
        int safeLimit = limit <= 0 ? DEFAULT_LIMIT : Math.min(limit, MAX_LIMIT);
        return timelineRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, safeLimit))
                .stream()
                .map(WebsiteAuditTimelineEventResponse::from)
                .toList();
    }

    private static String blankToUnknown(String value) {
        return value == null || value.isBlank() ? "<unknown>" : value;
    }
}
