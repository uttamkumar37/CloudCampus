package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.ContentBlockCreateRequest;
import com.cloudcampus.experience.dto.request.ContentBlockUpdateRequest;
import com.cloudcampus.experience.dto.response.ContentBlockResponse;
import com.cloudcampus.experience.entity.ContentBlock;
import com.cloudcampus.experience.repository.ContentBlockRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional(readOnly = true)
public class ContentBlockService {

    private final ContentBlockRepository repo;

    public ContentBlockService(ContentBlockRepository repo) {
        this.repo = repo;
    }

    /**
     * Resolve a single block: tenant override wins over global.
     * Result is cached per key+locale+tenantId for 2 minutes.
     */
    @Cacheable(value = "exp:block", key = "#key + ':' + #locale + ':' + #tenantId")
    public ContentBlockResponse getBlock(String key, String locale, UUID tenantId) {
        if (tenantId != null) {
            Optional<ContentBlock> tenantBlock = repo.findPublishedByTenantAndKey(tenantId, key, locale);
            if (tenantBlock.isPresent()) return ContentBlockResponse.from(tenantBlock.get());
        }
        return repo.findPublishedGlobalByKey(key, locale)
                .map(ContentBlockResponse::from)
                .orElseThrow(() -> new NotFoundException("Content block not found: " + key));
    }

    /**
     * Batch fetch — returns map of blockKey → response.
     * Missing keys are silently omitted (caller handles fallback).
     */
    public Map<String, ContentBlockResponse> getBlocks(List<String> keys, String locale, UUID tenantId) {
        Map<String, ContentBlockResponse> result = new LinkedHashMap<>();
        List<ContentBlock> globals = repo.findPublishedGlobalByKeys(keys, locale);
        for (ContentBlock b : globals) result.put(b.getBlockKey(), ContentBlockResponse.from(b));

        // Tenant overrides replace globals
        if (tenantId != null) {
            for (String key : keys) {
                repo.findPublishedByTenantAndKey(tenantId, key, locale)
                        .ifPresent(b -> result.put(b.getBlockKey(), ContentBlockResponse.from(b)));
            }
        }
        return result;
    }

    public List<ContentBlockResponse> listGlobal() {
        return repo.findByTenantIdIsNullOrderByBlockKeyAscVersionDesc()
                .stream().map(ContentBlockResponse::from).toList();
    }

    @Transactional
    public ContentBlockResponse create(ContentBlockCreateRequest req, UUID actorId) {
        ContentBlock block = ContentBlock.create(
                req.tenantId(), req.blockKey(), req.blockType(),
                req.content(), req.locale() != null ? req.locale() : "en", actorId
        );
        return ContentBlockResponse.from(repo.save(block));
    }

    @Transactional
    public ContentBlockResponse update(UUID id, ContentBlockUpdateRequest req) {
        ContentBlock block = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Block not found"));
        block.updateContent(req.content());
        return ContentBlockResponse.from(repo.save(block));
    }

    @Transactional
    @CacheEvict(value = "exp:block", key = "#id")
    public ContentBlockResponse publish(UUID id) {
        ContentBlock block = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Block not found"));
        block.publish();
        return ContentBlockResponse.from(repo.save(block));
    }
}
