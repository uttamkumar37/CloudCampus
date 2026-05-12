package com.cloudcampus.homework.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.homework.dto.HomeworkCreateRequest;
import com.cloudcampus.homework.dto.HomeworkResponse;
import com.cloudcampus.homework.entity.HomeworkAssignment;
import com.cloudcampus.homework.entity.HomeworkStatus;
import com.cloudcampus.homework.repository.HomeworkRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class HomeworkServiceImpl implements HomeworkService {

    private final HomeworkRepository homeworkRepository;

    public HomeworkServiceImpl(HomeworkRepository homeworkRepository) {
        this.homeworkRepository = homeworkRepository;
    }

    @Override
    @Transactional
    public HomeworkResponse create(UUID tenantId, UUID schoolId, UUID assignedBy, HomeworkCreateRequest req) {
        HomeworkAssignment hw = HomeworkAssignment.create(
                tenantId, schoolId, req.academicYearId(),
                req.classId(), req.sectionId(), req.subjectId(),
                assignedBy, req.title(), req.description(), req.dueDate()
        );
        if (req.publishImmediately()) {
            hw.publish();
        }
        homeworkRepository.save(hw);
        return HomeworkResponse.from(hw);
    }

    @Override
    public PageResponse<HomeworkResponse> list(UUID schoolId, UUID academicYearId,
                                               UUID classId, UUID sectionId,
                                               HomeworkStatus status, int page, int size) {
        Page<HomeworkAssignment> result = homeworkRepository.findFiltered(
                schoolId, academicYearId, classId, sectionId, status,
                PageRequest.of(page, size)
        );
        return new PageResponse<>(
                result.getContent().stream().map(HomeworkResponse::from).toList(),
                page * size,
                size,
                result.getTotalElements()
        );
    }

    @Override
    public HomeworkResponse getById(UUID schoolId, UUID homeworkId) {
        return HomeworkResponse.from(findOrThrow(schoolId, homeworkId));
    }

    @Override
    @Transactional
    public HomeworkResponse updateStatus(UUID schoolId, UUID homeworkId, HomeworkStatus status) {
        HomeworkAssignment hw = findOrThrow(schoolId, homeworkId);
        switch (status) {
            case PUBLISHED -> {
                if (hw.getStatus() != HomeworkStatus.DRAFT) {
                    throw new BadRequestException("Only DRAFT assignments can be published");
                }
                hw.publish();
            }
            case CLOSED -> {
                if (hw.getStatus() == HomeworkStatus.CLOSED) {
                    throw new BadRequestException("Assignment is already closed");
                }
                hw.close();
            }
            default -> throw new BadRequestException("Invalid target status: " + status);
        }
        return HomeworkResponse.from(hw);
    }

    @Override
    @Transactional
    public void delete(UUID schoolId, UUID homeworkId) {
        HomeworkAssignment hw = findOrThrow(schoolId, homeworkId);
        if (hw.getStatus() == HomeworkStatus.PUBLISHED) {
            throw new BadRequestException("Published assignments cannot be deleted; close them first");
        }
        homeworkRepository.delete(hw);
    }

    private HomeworkAssignment findOrThrow(UUID schoolId, UUID homeworkId) {
        return homeworkRepository.findBySchoolIdAndId(schoolId, homeworkId)
                .orElseThrow(() -> new NotFoundException("Homework assignment not found"));
    }
}
