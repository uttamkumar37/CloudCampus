package com.cloudcampus.school.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.dto.SectionRequest;
import com.cloudcampus.school.dto.SectionResponse;
import com.cloudcampus.school.entity.Section;
import com.cloudcampus.school.repository.SectionRepository;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
class SectionServiceImpl implements SectionService {

    private final SectionRepository repo;
    private final CacheManager cacheManager;

    SectionServiceImpl(SectionRepository repo, CacheManager cacheManager) {
        this.repo = repo;
        this.cacheManager = cacheManager;
    }

    @Override
    @Transactional
    // L-25: evict only the affected class's entry, not all tenants'
    @CacheEvict(value = "sections", key = "#req.classId")
    public SectionResponse create(UUID schoolId, SectionRequest req) {
        if (repo.existsByClassIdAndName(req.classId(), req.name())) {
            throw new BadRequestException(
                    "Section '" + req.name() + "' already exists for this class");
        }
        Section section = Section.create(
                UUID.fromString(RequestContext.getTenantId()), schoolId, req.classId(),
                req.name(), req.capacity()
        );
        return SectionResponse.from(repo.save(section));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "sections", key = "#classId")
    public List<SectionResponse> listByClass(UUID classId) {
        return repo.findAllByClassIdOrderByNameAsc(classId)
                   .stream()
                   .map(SectionResponse::from)
                   .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SectionResponse getById(UUID id) {
        return SectionResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = "sections", key = "#result.classId")
    public SectionResponse update(UUID id, SectionRequest req) {
        Section section = findOrThrow(id);
        section.setName(req.name());
        section.setCapacity(req.capacity());
        return SectionResponse.from(repo.save(section));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Section section = findOrThrow(id);
        UUID classId = section.getClassId();
        repo.deleteById(id);
        // L-25: evict only the affected class, not the entire cache
        Cache cache = cacheManager.getCache("sections");
        if (cache != null) cache.evict(classId);
    }

    private Section findOrThrow(UUID id) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return repo.findByIdAndTenantId(id, tenantId)
                   .orElseThrow(() -> new NotFoundException("Section not found: " + id));
    }
}
