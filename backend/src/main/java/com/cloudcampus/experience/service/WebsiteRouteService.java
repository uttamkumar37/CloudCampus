package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.WebsiteRouteCreateRequest;
import com.cloudcampus.experience.dto.request.WebsiteRouteUpdateRequest;
import com.cloudcampus.experience.dto.response.WebsiteRouteResponse;
import com.cloudcampus.experience.entity.WebsiteRouteConfig;
import com.cloudcampus.experience.repository.WebsiteRouteConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class WebsiteRouteService {

    private final WebsiteRouteConfigRepository repository;

    public WebsiteRouteService(WebsiteRouteConfigRepository repository) {
        this.repository = repository;
    }

    public List<WebsiteRouteResponse> listAll() {
        return repository.findAllByOrderByUpdatedAtDesc().stream().map(WebsiteRouteResponse::from).toList();
    }

    @Transactional
    public WebsiteRouteResponse create(WebsiteRouteCreateRequest req, UUID actorId) {
        WebsiteRouteConfig route = WebsiteRouteConfig.create(
                req.routePath(),
                req.audienceType(),
                req.title(),
                nullSafeMap(req.seoJson()),
                nullSafeMap(req.layoutJson()),
                nullSafeMap(req.ctaJson()),
                actorId
        );
        return WebsiteRouteResponse.from(repository.save(route));
    }

    @Transactional
    public WebsiteRouteResponse update(UUID id, WebsiteRouteUpdateRequest req) {
        WebsiteRouteConfig route = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Website route not found"));
        route.update(
                req.audienceType(),
                req.title(),
                nullSafeMap(req.seoJson()),
                nullSafeMap(req.layoutJson()),
                nullSafeMap(req.ctaJson())
        );
        return WebsiteRouteResponse.from(repository.save(route));
    }

    @Transactional
    public WebsiteRouteResponse publish(UUID id) {
        WebsiteRouteConfig route = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Website route not found"));
        route.publish();
        return WebsiteRouteResponse.from(repository.save(route));
    }

    private static Map<String, Object> nullSafeMap(Map<String, Object> input) {
        return input == null ? Map.of() : input;
    }
}
