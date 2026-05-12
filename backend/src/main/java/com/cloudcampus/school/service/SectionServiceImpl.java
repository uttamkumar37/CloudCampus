package com.cloudcampus.school.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.dto.SectionRequest;
import com.cloudcampus.school.dto.SectionResponse;
import com.cloudcampus.school.entity.Section;
import com.cloudcampus.school.repository.SectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
class SectionServiceImpl implements SectionService {

    private final SectionRepository repo;

    SectionServiceImpl(SectionRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
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
    public SectionResponse update(UUID id, SectionRequest req) {
        Section section = findOrThrow(id);
        section.setName(req.name());
        section.setCapacity(req.capacity());
        return SectionResponse.from(repo.save(section));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!repo.existsById(id)) {
            throw new NotFoundException("Section not found: " + id);
        }
        repo.deleteById(id);
    }

    private Section findOrThrow(UUID id) {
        return repo.findById(id)
                   .orElseThrow(() -> new NotFoundException("Section not found: " + id));
    }
}
