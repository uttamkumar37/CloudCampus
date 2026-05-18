package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.response.PresentationResponse;
import com.cloudcampus.experience.entity.Presentation;
import com.cloudcampus.experience.repository.PresentationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PresentationService {

    private final PresentationRepository repo;

    public PresentationService(PresentationRepository repo) {
        this.repo = repo;
    }

    public List<PresentationResponse> listAll() {
        return repo.findAll().stream().map(PresentationResponse::from).toList();
    }

    public PresentationResponse getBySlug(String slug) {
        return repo.findBySlugAndStatus(slug, "PUBLISHED")
                .map(PresentationResponse::from)
                .orElseThrow(() -> new NotFoundException("Presentation not found: " + slug));
    }

    @Transactional
    public PresentationResponse create(String title, String slug, String audienceType, UUID actorId) {
        Presentation p = Presentation.create(title, slug, audienceType, actorId);
        return PresentationResponse.from(repo.save(p));
    }

    @Transactional
    public PresentationResponse publish(UUID id) {
        Presentation p = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Presentation not found"));
        p.publish();
        return PresentationResponse.from(repo.save(p));
    }
}
