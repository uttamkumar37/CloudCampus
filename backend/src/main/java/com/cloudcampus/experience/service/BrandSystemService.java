package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.BrandSystemCreateRequest;
import com.cloudcampus.experience.dto.request.BrandSystemUpdateRequest;
import com.cloudcampus.experience.dto.response.BrandSystemResponse;
import com.cloudcampus.experience.entity.BrandSystem;
import com.cloudcampus.experience.repository.BrandSystemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class BrandSystemService {

    private final BrandSystemRepository repository;

    public BrandSystemService(BrandSystemRepository repository) {
        this.repository = repository;
    }

    public List<BrandSystemResponse> listAll() {
        return repository.findAllByOrderByUpdatedAtDesc().stream().map(BrandSystemResponse::from).toList();
    }

    @Transactional
    public BrandSystemResponse create(BrandSystemCreateRequest req, UUID actorId) {
        BrandSystem created = BrandSystem.create(
                req.name(),
                req.code(),
                nullSafeMap(req.tokenJson()),
                nullSafeMap(req.typographyJson()),
                nullSafeMap(req.motionJson()),
                actorId
        );
        return BrandSystemResponse.from(repository.save(created));
    }

    @Transactional
    public BrandSystemResponse update(UUID id, BrandSystemUpdateRequest req) {
        BrandSystem brandSystem = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Brand system not found"));
        brandSystem.update(
                req.name(),
                nullSafeMap(req.tokenJson()),
                nullSafeMap(req.typographyJson()),
                nullSafeMap(req.motionJson())
        );
        return BrandSystemResponse.from(repository.save(brandSystem));
    }

    @Transactional
    public BrandSystemResponse publish(UUID id) {
        BrandSystem brandSystem = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Brand system not found"));
        brandSystem.publish();
        return BrandSystemResponse.from(repository.save(brandSystem));
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Map.of() : input;
    }
}
