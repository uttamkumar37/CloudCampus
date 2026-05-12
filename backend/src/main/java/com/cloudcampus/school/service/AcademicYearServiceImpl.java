package com.cloudcampus.school.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.dto.AcademicYearRequest;
import com.cloudcampus.school.dto.AcademicYearResponse;
import com.cloudcampus.school.entity.AcademicYear;
import com.cloudcampus.school.entity.AcademicYearStatus;
import com.cloudcampus.school.repository.AcademicYearRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
class AcademicYearServiceImpl implements AcademicYearService {

    private final AcademicYearRepository repo;

    AcademicYearServiceImpl(AcademicYearRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    public AcademicYearResponse create(UUID schoolId, AcademicYearRequest req) {
        if (!req.endDate().isAfter(req.startDate())) {
            throw new BadRequestException("endDate must be after startDate");
        }
        if (repo.existsBySchoolIdAndName(schoolId, req.name())) {
            throw new BadRequestException("Academic year '" + req.name() + "' already exists for this school");
        }
        if (req.makeCurrent()) {
            repo.clearCurrentForSchool(schoolId);
        }
        AcademicYear year = AcademicYear.create(
                UUID.fromString(RequestContext.getTenantId()), schoolId,
                req.name(), req.startDate(), req.endDate(), req.makeCurrent()
        );
        return AcademicYearResponse.from(repo.save(year));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicYearResponse> listBySchool(UUID schoolId) {
        return repo.findAllBySchoolIdOrderByStartDateDesc(schoolId)
                   .stream()
                   .map(AcademicYearResponse::from)
                   .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicYearResponse getById(UUID id) {
        return AcademicYearResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    public AcademicYearResponse update(UUID id, AcademicYearRequest req) {
        if (!req.endDate().isAfter(req.startDate())) {
            throw new BadRequestException("endDate must be after startDate");
        }
        AcademicYear year = findOrThrow(id);
        year.setName(req.name());
        year.setStartDate(req.startDate());
        year.setEndDate(req.endDate());
        if (req.makeCurrent() && !year.isCurrent()) {
            repo.clearCurrentForSchool(year.getSchoolId());
            year.setCurrent(true);
        }
        return AcademicYearResponse.from(repo.save(year));
    }

    @Override
    @Transactional
    public AcademicYearResponse setAsCurrent(UUID id) {
        AcademicYear year = findOrThrow(id);
        repo.clearCurrentForSchool(year.getSchoolId());
        year.setCurrent(true);
        return AcademicYearResponse.from(repo.save(year));
    }

    @Override
    @Transactional
    public void close(UUID id) {
        AcademicYear year = findOrThrow(id);
        if (year.getStatus() == AcademicYearStatus.CLOSED) {
            throw new BadRequestException("Academic year is already closed");
        }
        year.setStatus(AcademicYearStatus.CLOSED);
        year.setCurrent(false);
        repo.save(year);
    }

    // ─────────────────────────────────────────────────────────────────────────

    private AcademicYear findOrThrow(UUID id) {
        return repo.findById(id)
                   .orElseThrow(() -> new NotFoundException("Academic year not found: " + id));
    }
}
