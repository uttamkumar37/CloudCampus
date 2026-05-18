package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.StorySceneCreateRequest;
import com.cloudcampus.experience.dto.request.StorySceneUpdateRequest;
import com.cloudcampus.experience.dto.response.StorySceneResponse;
import com.cloudcampus.experience.entity.StoryScene;
import com.cloudcampus.experience.repository.StorySceneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class StorySceneService {

    private final StorySceneRepository repository;

    public StorySceneService(StorySceneRepository repository) {
        this.repository = repository;
    }

    public List<StorySceneResponse> listAll() {
        return repository.findAllByOrderByUpdatedAtDesc().stream().map(StorySceneResponse::from).toList();
    }

    public List<StorySceneResponse> listPublished(String audienceType) {
        if (audienceType == null || audienceType.isBlank()) {
            return repository.findByPublishedTrueOrderByUpdatedAtDesc().stream().map(StorySceneResponse::from).toList();
        }
        return repository.findByAudienceTypeAndPublishedTrueOrderByUpdatedAtDesc(audienceType)
                .stream().map(StorySceneResponse::from).toList();
    }

    @Transactional
    public StorySceneResponse create(StorySceneCreateRequest req, UUID actorId) {
        StoryScene scene = StoryScene.create(
                req.sceneKey(),
                req.title(),
                req.audienceType(),
                nullSafeMap(req.timelineJson()),
                nullSafeList(req.proofPointsJson()),
                nullSafeMap(req.animationJson()),
                actorId
        );
        return StorySceneResponse.from(repository.save(scene));
    }

    @Transactional
    public StorySceneResponse update(UUID id, StorySceneUpdateRequest req) {
        StoryScene scene = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Story scene not found"));
        scene.update(
                req.title(),
                req.audienceType(),
                nullSafeMap(req.timelineJson()),
                nullSafeList(req.proofPointsJson()),
                nullSafeMap(req.animationJson())
        );
        return StorySceneResponse.from(repository.save(scene));
    }

    @Transactional
    public StorySceneResponse publish(UUID id) {
        StoryScene scene = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Story scene not found"));
        scene.publish();
        return StorySceneResponse.from(repository.save(scene));
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Collections.emptyMap() : input;
    }

    private static List<Object> nullSafeList(List<Object> input) {
        return input == null ? Collections.emptyList() : input;
    }
}
