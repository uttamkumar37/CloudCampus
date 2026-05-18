package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.StakeholderJourneyCreateRequest;
import com.cloudcampus.experience.dto.request.StakeholderJourneyUpdateRequest;
import com.cloudcampus.experience.dto.response.StakeholderJourneyResponse;
import com.cloudcampus.experience.entity.StakeholderJourney;
import com.cloudcampus.experience.repository.StakeholderJourneyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class StakeholderJourneyService {

    private final StakeholderJourneyRepository repository;

    public StakeholderJourneyService(StakeholderJourneyRepository repository) {
        this.repository = repository;
    }

    public List<StakeholderJourneyResponse> listAll() {
        return repository.findAllByOrderByUpdatedAtDesc().stream().map(StakeholderJourneyResponse::from).toList();
    }

    @Transactional
    public StakeholderJourneyResponse create(StakeholderJourneyCreateRequest req, UUID actorId) {
        StakeholderJourney journey = StakeholderJourney.create(
                req.stakeholderType(),
                req.journeyKey(),
                req.name(),
                req.conversionGoal(),
                nullSafeMap(req.narrativeJson()),
                nullSafeList(req.touchpointsJson()),
                actorId
        );
        return StakeholderJourneyResponse.from(repository.save(journey));
    }

    @Transactional
    public StakeholderJourneyResponse update(UUID id, StakeholderJourneyUpdateRequest req) {
        StakeholderJourney journey = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Stakeholder journey not found"));
        journey.update(
                req.name(),
                req.conversionGoal(),
                nullSafeMap(req.narrativeJson()),
                nullSafeList(req.touchpointsJson())
        );
        return StakeholderJourneyResponse.from(repository.save(journey));
    }

    @Transactional
    public StakeholderJourneyResponse publish(UUID id) {
        StakeholderJourney journey = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Stakeholder journey not found"));
        journey.publish();
        return StakeholderJourneyResponse.from(repository.save(journey));
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Map.of() : input;
    }

    private static List<Object> nullSafeList(List<Object> input) {
        return input == null ? List.of() : input;
    }
}
