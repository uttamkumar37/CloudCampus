package com.cloudcampus.school.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.dto.ClassRoomRequest;
import com.cloudcampus.school.dto.ClassRoomResponse;
import com.cloudcampus.school.entity.ClassRoom;
import com.cloudcampus.school.repository.ClassRoomRepository;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
class ClassRoomServiceImpl implements ClassRoomService {

    private final ClassRoomRepository repo;
    private final CacheManager cacheManager;

    ClassRoomServiceImpl(ClassRoomRepository repo, CacheManager cacheManager) {
        this.repo = repo;
        this.cacheManager = cacheManager;
    }

    @Override
    @Transactional
    // L-25: evict only the affected academic year's entry, not all tenants'
    @CacheEvict(value = "classes", key = "#req.academicYearId")
    public ClassRoomResponse create(UUID schoolId, ClassRoomRequest req) {
        if (repo.existsBySchoolIdAndAcademicYearIdAndName(schoolId, req.academicYearId(), req.name())) {
            throw new BadRequestException(
                    "Class '" + req.name() + "' already exists for this academic year");
        }
        ClassRoom classRoom = ClassRoom.create(
                UUID.fromString(RequestContext.getTenantId()), schoolId, req.academicYearId(),
                req.name(), req.gradeOrder()
        );
        classRoom.setDisplayName(req.displayName());
        return ClassRoomResponse.from(repo.save(classRoom));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "classes", key = "#academicYearId")
    public List<ClassRoomResponse> listByAcademicYear(UUID academicYearId) {
        return repo.findAllByAcademicYearIdOrderByGradeOrderAscNameAsc(academicYearId)
                   .stream()
                   .map(ClassRoomResponse::from)
                   .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClassRoomResponse getById(UUID id) {
        return ClassRoomResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = "classes", key = "#result.academicYearId")
    public ClassRoomResponse update(UUID id, ClassRoomRequest req) {
        ClassRoom classRoom = findOrThrow(id);
        classRoom.setName(req.name());
        classRoom.setDisplayName(req.displayName());
        classRoom.setGradeOrder(req.gradeOrder());
        return ClassRoomResponse.from(repo.save(classRoom));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        ClassRoom classRoom = findOrThrow(id);
        UUID academicYearId = classRoom.getAcademicYearId();
        repo.deleteById(id);
        // L-25: evict only the affected academic year, not the entire cache
        Cache cache = cacheManager.getCache("classes");
        if (cache != null) cache.evict(academicYearId);
    }

    private ClassRoom findOrThrow(UUID id) {
        return repo.findById(id)
                   .orElseThrow(() -> new NotFoundException("Class not found: " + id));
    }
}
