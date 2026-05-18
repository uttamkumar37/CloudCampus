package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.WebsiteTemplateCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteTemplateUpdateRequest;
import com.cloudcampus.experience.dto.response.WebsiteTemplateResponse;
import com.cloudcampus.experience.entity.WebsiteTemplate;
import com.cloudcampus.experience.repository.WebsiteTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class WebsiteTemplateService {

    private final WebsiteTemplateRepository repository;

    public WebsiteTemplateService(WebsiteTemplateRepository repository) {
        this.repository = repository;
    }

    public List<WebsiteTemplateResponse> listAll() {
        return repository.findAllByOrderByUpdatedAtDesc().stream().map(WebsiteTemplateResponse::from).toList();
    }

    public List<WebsiteTemplateResponse> listPublished() {
        return repository.findByPublishedTrueOrderByUpdatedAtDesc().stream().map(WebsiteTemplateResponse::from).toList();
    }

    @Transactional
    public WebsiteTemplateResponse create(WebsiteTemplateCreateRequest req, UUID actorId) {
        WebsiteTemplate template = WebsiteTemplate.create(
                req.templateKey(),
                req.name(),
                req.category(),
                req.previewImageUrl(),
                nullSafeList(req.tags()),
                nullSafeMap(req.schemaJson()),
                nullSafeMap(req.defaultBrandingJson()),
                actorId
        );
        return WebsiteTemplateResponse.from(repository.save(template));
    }

    @Transactional
    public WebsiteTemplateResponse update(UUID id, WebsiteTemplateUpdateRequest req) {
        WebsiteTemplate template = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Website template not found"));
        template.update(
                req.name(),
                req.category(),
                req.previewImageUrl(),
                nullSafeList(req.tags()),
                nullSafeMap(req.schemaJson()),
                nullSafeMap(req.defaultBrandingJson())
        );
        return WebsiteTemplateResponse.from(repository.save(template));
    }

    @Transactional
    public WebsiteTemplateResponse publish(UUID id) {
        WebsiteTemplate template = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Website template not found"));
        template.publish();
        return WebsiteTemplateResponse.from(repository.save(template));
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Collections.emptyMap() : input;
    }

    private static List<String> nullSafeList(List<String> input) {
        return input == null ? Collections.emptyList() : input;
    }
}
