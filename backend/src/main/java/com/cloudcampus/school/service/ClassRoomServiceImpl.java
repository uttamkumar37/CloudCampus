package com.cloudcampus.school.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.dto.ClassRoomRequest;
import com.cloudcampus.school.dto.ClassRoomResponse;
import com.cloudcampus.school.entity.ClassRoom;
import com.cloudcampus.school.repository.ClassRoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
class ClassRoomServiceImpl implements ClassRoomService {

    private final ClassRoomRepository repo;

    ClassRoomServiceImpl(ClassRoomRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
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
        if (!repo.existsById(id)) {
            throw new NotFoundException("Class not found: " + id);
        }
        repo.deleteById(id);
    }

    private ClassRoom findOrThrow(UUID id) {
        return repo.findById(id)
                   .orElseThrow(() -> new NotFoundException("Class not found: " + id));
    }
}
