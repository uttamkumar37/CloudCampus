package com.cloudcampus.school.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.dto.SubjectRequest;
import com.cloudcampus.school.dto.SubjectResponse;
import com.cloudcampus.school.entity.Subject;
import com.cloudcampus.school.repository.SubjectRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository repo;

    SubjectServiceImpl(SubjectRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    // L-25: evict only the two affected school entries, not all tenants'
    @Caching(evict = {
        @CacheEvict(value = "subjects", key = "#schoolId"),
        @CacheEvict(value = "subjects", key = "#schoolId + ':active'")
    })
    public SubjectResponse create(UUID schoolId, SubjectRequest req) {
        if (repo.existsBySchoolIdAndCode(schoolId, req.code())) {
            throw new BadRequestException("Subject code '" + req.code() + "' already exists for this school");
        }
        Subject subject = Subject.create(
                UUID.fromString(RequestContext.getTenantId()), schoolId,
                req.name(), req.code(), req.description()
        );
        return SubjectResponse.from(repo.save(subject));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "subjects", key = "#schoolId")
    public List<SubjectResponse> listBySchool(UUID schoolId) {
        return repo.findAllBySchoolIdOrderByNameAsc(schoolId)
                   .stream()
                   .map(SubjectResponse::from)
                   .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "subjects", key = "#schoolId + ':active'")
    public List<SubjectResponse> listActive(UUID schoolId) {
        return repo.findAllBySchoolIdAndIsActiveOrderByNameAsc(schoolId, true)
                   .stream()
                   .map(SubjectResponse::from)
                   .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SubjectResponse getById(UUID id) {
        return SubjectResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "subjects", key = "#result.schoolId"),
        @CacheEvict(value = "subjects", key = "#result.schoolId + ':active'")
    })
    public SubjectResponse update(UUID id, SubjectRequest req) {
        Subject subject = findOrThrow(id);
        if (!subject.getCode().equals(req.code())
                && repo.existsBySchoolIdAndCode(subject.getSchoolId(), req.code())) {
            throw new BadRequestException("Subject code '" + req.code() + "' already exists for this school");
        }
        subject.setName(req.name());
        subject.setCode(req.code());
        subject.setDescription(req.description());
        return SubjectResponse.from(repo.save(subject));
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "subjects", key = "#result.schoolId"),
        @CacheEvict(value = "subjects", key = "#result.schoolId + ':active'")
    })
    public SubjectResponse deactivate(UUID id) {
        Subject subject = findOrThrow(id);
        if (!subject.isActive()) {
            throw new BadRequestException("Subject is already inactive");
        }
        subject.setActive(false);
        return SubjectResponse.from(repo.save(subject));
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "subjects", key = "#result.schoolId"),
        @CacheEvict(value = "subjects", key = "#result.schoolId + ':active'")
    })
    public SubjectResponse activate(UUID id) {
        Subject subject = findOrThrow(id);
        if (subject.isActive()) {
            throw new BadRequestException("Subject is already active");
        }
        subject.setActive(true);
        return SubjectResponse.from(repo.save(subject));
    }

    private Subject findOrThrow(UUID id) {
        return repo.findById(id)
                   .orElseThrow(() -> new NotFoundException("Subject not found: " + id));
    }
}
