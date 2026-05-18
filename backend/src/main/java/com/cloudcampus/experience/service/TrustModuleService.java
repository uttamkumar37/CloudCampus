package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.TrustModuleCreateRequest;
import com.cloudcampus.experience.dto.request.TrustModuleUpdateRequest;
import com.cloudcampus.experience.dto.response.TrustModuleResponse;
import com.cloudcampus.experience.entity.TrustModule;
import com.cloudcampus.experience.repository.TrustModuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class TrustModuleService {

    private final TrustModuleRepository repository;

    public TrustModuleService(TrustModuleRepository repository) {
        this.repository = repository;
    }

    public List<TrustModuleResponse> listAll() {
        return repository.findAllByOrderByUpdatedAtDesc().stream().map(TrustModuleResponse::from).toList();
    }

    public List<TrustModuleResponse> listPublished() {
        return repository.findByPublishedTrueOrderByUpdatedAtDesc().stream().map(TrustModuleResponse::from).toList();
    }

    @Transactional
    public TrustModuleResponse create(TrustModuleCreateRequest req, UUID actorId) {
        TrustModule module = TrustModule.create(
                req.moduleKey(),
                req.title(),
                req.category(),
                nullSafeMap(req.evidenceJson()),
                nullSafeMap(req.metricsJson()),
                nullSafeMap(req.displayJson()),
                actorId
        );
        return TrustModuleResponse.from(repository.save(module));
    }

    @Transactional
    public TrustModuleResponse update(UUID id, TrustModuleUpdateRequest req) {
        TrustModule module = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Trust module not found"));
        module.update(
                req.title(),
                req.category(),
                nullSafeMap(req.evidenceJson()),
                nullSafeMap(req.metricsJson()),
                nullSafeMap(req.displayJson())
        );
        return TrustModuleResponse.from(repository.save(module));
    }

    @Transactional
    public TrustModuleResponse publish(UUID id) {
        TrustModule module = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Trust module not found"));
        module.publish();
        return TrustModuleResponse.from(repository.save(module));
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Collections.emptyMap() : input;
    }
}
