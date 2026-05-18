package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.StoryScene;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StorySceneRepository extends JpaRepository<StoryScene, UUID> {
    List<StoryScene> findAllByOrderByUpdatedAtDesc();

    List<StoryScene> findByPublishedTrueOrderByUpdatedAtDesc();

    List<StoryScene> findByAudienceTypeAndPublishedTrueOrderByUpdatedAtDesc(String audienceType);
}
